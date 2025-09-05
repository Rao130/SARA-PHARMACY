# Sara Pharmacy - Complete Healthcare Solution

A comprehensive pharmacy management system with real-time order tracking, inventory management, and mobile app integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd sara-pharmacy
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Mobile App Setup (Optional)**
```bash
cd medishop-mobile
npm install
npm start
```

## 📱 Features

### For Customers
- 🛒 Browse medicines with detailed information
- 🔍 Symptom checker and medicine search
- 📋 Prescription upload and scheduling
- 🛒 Shopping cart and checkout
- 📦 Real-time order tracking
- 💳 Multiple payment options
- 📱 Mobile app for on-the-go access

### For Admins
- 📊 Comprehensive dashboard
- 👥 Customer management
- 💊 Medicine inventory management
- 📦 Order management with status updates
- 🚚 Delivery partner assignment
- 📢 Announcements and notifications
- 📈 Sales analytics and reports

### For Delivery Partners
- 🗺️ Real-time location tracking
- 📦 Order assignment and management
- 🔔 Push notifications
- 📍 GPS navigation integration

## 🛠️ Technology Stack

### Backend
- **Framework:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with bcrypt
- **Real-time:** Socket.IO
- **Security:** Helmet, CORS, Rate Limiting
- **File Upload:** Multer
- **Push Notifications:** Firebase Admin SDK

### Frontend
- **Framework:** React 18 with Vite
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client
- **Forms:** React Hook Form with Yup validation
- **Styling:** CSS3, Sass, Tailwind CSS

### Mobile App
- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **UI:** Native components with TypeScript

## 🏗️ Project Structure

```
sara-pharmacy/
├── backend/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication & validation
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Route components
│   │   ├── contexts/       # React contexts
│   │   ├── redux/          # State management
│   │   └── utils/          # Helper functions
└── medishop-mobile/        # React Native app
```

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 5006)
- `FIREBASE_*` - Firebase configuration for push notifications

**Frontend (.env):**
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL

## 📝 API Documentation

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/forgot-password` - Password reset

### Medicines
- `GET /api/v1/medicines` - Get all medicines
- `POST /api/v1/medicines` - Add new medicine (Admin)
- `GET /api/v1/medicines/search` - Search medicines

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user orders
- `PATCH /api/v1/orders/:id/status` - Update order status (Admin)

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Environment Configuration
- Set `NODE_ENV=production` for backend
- Configure proper CORS origins for production domains
- Set up MongoDB Atlas for production database
- Configure Firebase for production notifications

## 👨‍💻 Developer

**Primary Developer:** Shweat Yadav (Raosahabji)

## 📞 Support

For technical support or feature requests, please contact the development team.

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input sanitization and XSS protection
- CORS configuration
- File upload restrictions
- MongoDB injection protection

## 🔄 Real-time Features

- Live order status updates
- Real-time inventory tracking
- Push notifications for order updates
- Admin dashboard live updates
- Delivery tracking with GPS

---

**Status:** ✅ Production Ready
**Last Updated:** January 2025