import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { OrderCreation,createOrder } from '../services/api.js'; // Import the OrderCreation function
import { useParams } from 'react-router-dom';
import pay from '../Payments/pay.js';

const SubscriptionPlans = () => {
  const { userId } = useParams();
  const [sessionId, setSessionId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const plans = [
    {
      title: 'Monthly Plan',
      price: 49, // ₹50
      description: 'Subscribe to the monthly plan and enjoy reduced token usage.',
      benefits: ['10 tokens per verified user', '100 tokens on signup', 'Unlimited access for 30 days'],
      duration: '1 Month',
      planType: 'monthly',
    },
    {
      title: 'Yearly Plan',
      price: 499, // ₹500
      description: 'Subscribe to the yearly plan and get the best value with more benefits.',
      benefits: ['10 tokens per verified user', '100 tokens on signup', 'Unlimited access for 365 days'],
      duration: '1 Year',
      planType: 'yearly',
    }
  ];

  // Function to handle subscription
  const handleSubscription = async (plan) => {
    const token = localStorage.getItem('token');
    setLoading(true);
  
    const orderData = {
      orderId: `order_${userId}_${Date.now()}`,
      orderAmount: plan.price,
      customer_id: userId,
      customerName: 'Deepanshu',
      customerEmail: 'deepanshutaneja762@gmail.com',
      customerPhone: String('9999999999'),
    };
  
    try {
      // Step 1: Create order
      const result = await OrderCreation(orderData, token); // Call the function with orderData and token
      if (!result || !result.sessionId || !result.order_id) {
        throw new Error('Order creation failed: Invalid response from server');
      }
  
      const { sessionId, order_id } = result;
      console.log({ sessionId, order_id });
      setSessionId(sessionId);
      setOrderId(order_id);
  
      // Step 2: Initiate payment
      try {
        await pay(sessionId); // Attempt payment
      } catch (paymentError) {
        console.error('Payment failed:', paymentError);
        throw new Error('Payment failed: Please check your payment details or try again later.');
      }
  
      // Step 3: Finalize order
      try {
        await createOrder(sessionId, userId, order_id);
      } catch (orderFinalizationError) {
        console.error('Error finalizing the order:', orderFinalizationError);
        throw new Error('Failed to finalize the order: Please contact support.');
      }
  
      alert(`Order created successfully! Order ID: ${order_id}`);
    } catch (error) {
      // General error handling
      console.error('Error handling subscription:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Choose Your Subscription Plan</h2>
      <div className="row justify-content-center">
        {plans.map((plan, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="text-center">{plan.title}</Card.Title>
                <h3 className="text-center text-primary">₹{plan.price}</h3>
                <Card.Text className="text-center">
                  {plan.description}
                </Card.Text>
                <ul className="list-group mb-3">
                  {plan.benefits.map((benefit, idx) => (
                    <li className="list-group-item" key={idx}>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => handleSubscription(plan)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Subscribe for ${plan.duration}`}
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
