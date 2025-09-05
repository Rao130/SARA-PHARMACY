import Order from '../models/orderModel.js';
import axios from 'axios';

// @desc    Initiate UPI payment
// @route   POST /api/payment/upi
// @access  Private
export const initiateUpiPayment = async (req, res) => {
  try {
    const { orderId, upiId } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // In a real implementation, you would integrate with a UPI payment gateway here
    // For demo purposes, we'll simulate a successful payment
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock UPI transaction ID
    const upiTransactionId = `UPI${Date.now()}`;
    
    // Update order with payment details
    order.paymentResult = {
      id: upiTransactionId,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      upi_id: upiId,
      upi_transaction_id: upiTransactionId,
      upi_status: 'SUCCESS'
    };
    
    order.isPaid = true;
    order.paidAt = Date.now();
    
    const updatedOrder = await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      order: updatedOrder,
      transactionId: upiTransactionId
    });
    
  } catch (error) {
    console.error('UPI Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

// @desc    Verify UPI payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyUpiPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // In a real implementation, you would verify the payment with your payment gateway
    // For demo, we'll just return the current payment status
    
    res.status(200).json({
      success: true,
      isPaid: order.isPaid,
      paymentStatus: order.paymentResult?.status || 'PENDING'
    });
    
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};
