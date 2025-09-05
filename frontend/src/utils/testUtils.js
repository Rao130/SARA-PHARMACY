/**
 * Test utilities for the order tracking system
 */

import axiosInstance from '../api/axiosInstance';

/**
 * Simulate a complete order lifecycle for testing
 * @param {string} orderId - The ID of the order to simulate
 * @param {Object} options - Simulation options
 * @returns {Promise<Object>} - The simulation results
 */
export const simulateOrderLifecycle = async (orderId, options = {}) => {
  const {
    includeDelivery = true,
    delayBetweenSteps = 3000, // 3 seconds between status changes
    skipStatuses = [],
    stopAtStatus = null,
  } = options;
  
  const results = {
    orderId,
    statusUpdates: [],
    errors: [],
    simulationComplete: false
  };
  
  // Order status flow: pending -> processing -> shipped -> nearby -> delivered
  const statusFlow = ['pending', 'processing', 'shipped', 'nearby', 'delivered']
    .filter(status => !skipStatuses.includes(status));
  
  // If a stop status is specified, truncate the flow at that status
  if (stopAtStatus && statusFlow.includes(stopAtStatus)) {
    const stopIndex = statusFlow.indexOf(stopAtStatus);
    statusFlow.splice(stopIndex + 1);
  }
  
  try {
    // Get initial order state
    const initialOrderResponse = await axiosInstance.get(`/orders/${orderId}`);
    const initialOrder = initialOrderResponse?.data?.data;
    
    if (!initialOrder) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    results.initialStatus = initialOrder.status;
    
    // Start from the current status in the flow
    let startIndex = statusFlow.indexOf(initialOrder.status);
    if (startIndex === -1) startIndex = 0;
    
    // Process each status in sequence
    for (let i = startIndex; i < statusFlow.length; i++) {
      const status = statusFlow[i];
      
      // Skip if order is already at this status
      if (i === startIndex && status === initialOrder.status) {
        results.statusUpdates.push({
          status,
          timestamp: new Date().toISOString(),
          skipped: true,
          message: 'Order already at this status'
        });
        continue;
      }
      
      try {
        // Update order status
        await axiosInstance.patch(`/orders/${orderId}/status`, { status });
        
        results.statusUpdates.push({
          status,
          timestamp: new Date().toISOString(),
          success: true
        });
        
        // If we're moving to shipped status and delivery simulation is enabled,
        // start the delivery simulation
        if (status === 'shipped' && includeDelivery) {
          try {
            await axiosInstance.post(`/delivery/${orderId}/simulate`);
            results.deliverySimulationStarted = true;
          } catch (err) {
            results.errors.push({
              phase: 'delivery-simulation',
              error: err.message || 'Failed to start delivery simulation'
            });
          }
        }
        
        // Wait between status updates
        if (i < statusFlow.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenSteps));
        }
      } catch (err) {
        results.statusUpdates.push({
          status,
          timestamp: new Date().toISOString(),
          success: false,
          error: err.message || `Failed to update status to ${status}`
        });
        
        results.errors.push({
          phase: `status-update-${status}`,
          error: err.message || `Failed to update status to ${status}`
        });
        
        // Stop simulation if a status update fails
        break;
      }
    }
    
    // Stop delivery simulation if it was started
    if (results.deliverySimulationStarted) {
      try {
        await axiosInstance.delete(`/delivery/${orderId}/simulate`);
        results.deliverySimulationStopped = true;
      } catch (err) {
        results.errors.push({
          phase: 'delivery-simulation-stop',
          error: err.message || 'Failed to stop delivery simulation'
        });
      }
    }
    
    results.simulationComplete = true;
    return results;
  } catch (err) {
    results.errors.push({
      phase: 'simulation',
      error: err.message || 'Simulation failed'
    });
    return results;
  }
};

/**
 * Test the real-time updates by subscribing to Socket.IO events
 * @param {string} orderId - The order ID to test
 * @param {Object} options - Test options
 * @returns {Object} - Socket subscription controller
 */
export const testRealTimeUpdates = (orderId, options = {}) => {
  const {
    onOrderUpdate,
    onLocationUpdate,
    onError,
    timeout = 60000 // 1 minute default timeout
  } = options;
  
  // Import socket.io-client dynamically to avoid SSR issues
  const io = require('socket.io-client');
  
  // Create socket connection
  const socket = io('http://localhost:5006', {
    path: '/socket.io',
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
  });
  
  // Track events received
  const events = {
    orderUpdates: [],
    locationUpdates: [],
    errors: []
  };
  
  // Set up timeout
  const timeoutId = setTimeout(() => {
    if (onError) {
      onError(new Error('Test timeout reached'));
    }
    cleanup();
  }, timeout);
  
  // Set up event handlers
  socket.on('connect', () => {
    console.log('Socket connected for testing:', socket.id);
    // Join order-specific room
    socket.emit('joinOrderRoom', { orderId });
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error during test:', error);
    events.errors.push({
      type: 'connect_error',
      timestamp: new Date().toISOString(),
      error: error.message || 'Connection error'
    });
    
    if (onError) {
      onError(error);
    }
  });
  
  socket.on('orderUpdate', (data) => {
    console.log('Test received order update:', data);
    events.orderUpdates.push({
      timestamp: new Date().toISOString(),
      data
    });
    
    if (onOrderUpdate) {
      onOrderUpdate(data);
    }
  });
  
  socket.on('locationUpdate', (data) => {
    console.log('Test received location update:', data);
    events.locationUpdates.push({
      timestamp: new Date().toISOString(),
      data
    });
    
    if (onLocationUpdate) {
      onLocationUpdate(data);
    }
  });
  
  // Cleanup function
  const cleanup = () => {
    clearTimeout(timeoutId);
    socket.off('orderUpdate');
    socket.off('locationUpdate');
    socket.off('connect');
    socket.off('connect_error');
    socket.disconnect();
  };
  
  // Return controller object
  return {
    events,
    stop: cleanup,
    isConnected: () => socket.connected
  };
};

/**
 * Performance test for the tracking page
 * @param {string} orderId - The order ID to test
 * @returns {Promise<Object>} - Performance metrics
 */
export const measureTrackingPerformance = async (orderId) => {
  const metrics = {
    loadTime: 0,
    renderTime: 0,
    socketConnectionTime: 0,
    firstUpdateTime: 0,
    errors: []
  };
  
  const startTime = performance.now();
  
  try {
    // Measure API response time
    const apiStartTime = performance.now();
    const response = await axiosInstance.get(`/orders/${orderId}`);
    metrics.loadTime = performance.now() - apiStartTime;
    
    // Test socket connection time
    const socketTest = testRealTimeUpdates(orderId, {
      onOrderUpdate: () => {
        if (!metrics.firstUpdateTime) {
          metrics.firstUpdateTime = performance.now() - startTime;
        }
      },
      timeout: 10000 // 10 second timeout for performance test
    });
    
    // Wait for socket connection
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (socketTest.isConnected()) {
          metrics.socketConnectionTime = performance.now() - startTime;
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        metrics.errors.push('Socket connection timeout');
        resolve();
      }, 5000);
    });
    
    // Clean up socket test after 5 seconds
    setTimeout(() => {
      socketTest.stop();
    }, 5000);
    
    return metrics;
  } catch (err) {
    metrics.errors.push(err.message || 'Performance test failed');
    return metrics;
  }
};