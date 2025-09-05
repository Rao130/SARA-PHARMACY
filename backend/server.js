import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { errorHandler, catchAsync } from './middleware/error.js';
import helmet from 'helmet';
// Import rate limiters
import { 
  loginLimiter, 
  apiLimiter, 
  sensitiveLimiter, 
  strictLimiter, 
  uploadLimiter 
} from './middleware/rateLimiter.js';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Import routes
import authRoutes from './routes/auth.js';
import medicineRoutes from './routes/medicines.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import announcementRoutes from './routes/announcements.js';
import deviceRoutes from './routes/devices.js';
import paymentRoutes from './routes/paymentRoutes.js';
import deliveryPartnerRoutes from './routes/deliveryPartner.js';
import connectDB from './config/db.js';

// Initialize Express
const app = express();

// Create HTTP server
export const server = http.createServer(app);

// Helper function to get allowed origins based on environment
const getAllowedOrigins = () => {
  const baseOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.1.15:3000',
    'http://192.168.1.15:5173',
    'http://192.168.1.88:3000',
    'http://192.168.1.88:5173',
    /^http:\/\/192\.168\.1\.\d{1,3}(?::\d+)?$/
  ];
  
  // Add production origins if environment variables are set
  if (process.env.FRONTEND_URL) {
    baseOrigins.push(process.env.FRONTEND_URL);
  }
  
  if (process.env.PRODUCTION_ORIGINS) {
    const prodOrigins = process.env.PRODUCTION_ORIGINS.split(',').map(origin => origin.trim());
    baseOrigins.push(...prodOrigins);
  }
  
  return baseOrigins;
};

// Create Socket.IO server
export const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  path: '/socket.io/',
  serveClient: false,
  pingTimeout: 30000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8
});

// Middleware
// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// Serve static files (medicine images, etc.) from /uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, 'uploads');
// Add cache headers to avoid image flicker due to repeated reloads
app.use('/uploads', express.static(uploadsDir, {
  etag: true,
  lastModified: true,
  maxAge: '7d',
  cacheControl: true,
}));

// Apply rate limiting to routes
app.use('/api/v1/auth/login', loginLimiter);
app.use('/api/v1/auth/register', sensitiveLimiter);
app.use('/api/v1/auth/forgot-password', sensitiveLimiter);
app.use('/api/v1/auth/reset-password', sensitiveLimiter);

// Apply API rate limiting to all API routes
const apiRoutes = [
  '/api/v1/medicines',
  '/api/v1/orders',
  '/api/v1/users',
  '/api/v1/announcements',
  '/api/v1/devices'
];

apiRoutes.forEach(route => {
  app.use(route, apiLimiter);
});

// Apply strict rate limiting to public endpoints
app.use('/api/v1/public', strictLimiter);

// Apply upload rate limiting
app.use('/api/v1/upload', uploadLimiter);

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/medicines', medicineRoutes); // Add this line for the new search endpoint
app.use('/api/v1/orders', orderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/delivery-partners', deliveryPartnerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint to list available routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ availableRoutes: routes });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error Handler (should be after all routes)
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('=== Starting Server ===');
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? '*** MONGODB_URI is set ***' : 'MONGODB_URI is not set',
      PORT: process.env.PORT || 5002
    });
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB Connected Successfully');
      
      // Log database name and collections
      const db = mongoose.connection.db;
      console.log(`Connected to database: ${db.databaseName}`);
      
      // List all collections (for debugging)
      const collections = await db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
    } catch (mongoError) {
      const mongoURI = process.env.MONGODB_URI || '';
      const maskedURI = mongoURI ? 
        mongoURI.replace(/(mongodb\+srv?:\/\/[^:]+:)[^@]+(@.*)/, '$1*****$2') : 
        'Not set';
      console.error('MongoDB Connection Error:', mongoError);
      console.error('MongoDB Connection String:', maskedURI);
      process.exit(1);
    }

    // Initialize Firebase Admin
    try {
      // Check if Firebase configuration is available
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        const { initializeFirebase } = await import('./services/pushNotificationService.js');
        initializeFirebase();
        console.log('Firebase Admin initialized');
      } else {
        console.log('Firebase configuration not found - push notifications disabled');
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error.message);
      console.log('Push notifications will be disabled');
    }

    // Start server
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}...`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
      
      // Make io available globally AFTER server starts
      global.io = io;
      console.log('🔌 Socket.io made available globally');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('UNCAUGHT EXCEPTION! Shutting down...');
      console.error(err.name, err.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

io.on('connection', (socket) => {
  // Log connection details
  console.log(' Connection details:', {
    handshake: socket.handshake,
    rooms: [...socket.rooms],
    connected: socket.connected,
    disconnected: socket.disconnected
  });
  
  // Handle authentication if needed
  socket.on('authenticate', (token) => {
    try {
      // Verify token and handle authentication
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // socket.user = decoded;
      console.log(` Client ${socket.id} authenticated`);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error(` Authentication failed for ${socket.id}:`, error.message);
      socket.emit('unauthorized', { message: 'Authentication failed' });
      socket.disconnect();
    }
  });
  
  // Handle admin room joining
  socket.on('joinAdminRoom', (data) => {
    try {
      // Optional: Verify admin privileges here
      // if (!socket.user || socket.user.role !== 'admin') {
      //   throw new Error('Unauthorized: Admin access required');
      // }
      
      socket.join('admin');
      console.log(` Admin ${socket.id} joined admin room`);
      socket.emit('roomJoined', { room: 'admin' });
      
      // Send confirmation to admin
      io.to(socket.id).emit('admin:status', { 
        status: 'connected', 
        message: 'You are now connected to the admin room',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(` Error joining admin room:`, error.message);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle order room joining for real-time order tracking
  socket.on('joinOrderRoom', (data) => {
    try {
      const { orderId } = data;
      
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      
      // Join room specific to this order
      const roomName = `order:${orderId}`;
      socket.join(roomName);
      console.log(` Client ${socket.id} joined order room: ${roomName}`);
      
      // Confirm room joined
      socket.emit('roomJoined', { 
        room: roomName,
        message: `You are now tracking order ${orderId}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(` Error joining order room:`, error.message);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle delivery agent location updates
  socket.on('updateDeliveryLocation', (data) => {
    try {
      const { orderId, location, agentId } = data;
      if (!orderId || !location || !agentId) {
        socket.emit('location_error', { message: 'Order ID, location, and agent ID are required' });
        return;
      }
      
      // Verify the socket belongs to a delivery agent
      if (socket.userType !== 'delivery_agent' && socket.userType !== 'admin') {
        socket.emit('location_error', { message: 'Unauthorized: Only delivery agents can update locations' });
        return;
      }
      
      // Broadcast the location update to the order room
      const roomName = `order:${orderId}`;
      io.to(roomName).emit('locationUpdate', {
        orderId,
        location,
        agentId,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Location updated for order ${orderId} by agent ${agentId}`);
      socket.emit('location_updated', { success: true });
    } catch (error) {
      console.error('Location update error:', error);
      socket.emit('location_error', { message: 'Failed to update location' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(` Client ${socket.id} disconnected: ${reason}`);
    console.log('Remaining connections:', io.engine.clientsCount);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(` Socket error for ${socket.id}:`, error);
  });
});

// Make io available globally
global.io = io;

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  startServer().then(() => {
    console.log(' WebSocket server initialized');
    console.log(' Socket.IO path:', io.path());
    console.log(' Allowed origins:', io.engine.opts.cors.origin);
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}