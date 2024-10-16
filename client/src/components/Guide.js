import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaCoins, FaShoppingCart, FaCrown } from 'react-icons/fa';
import '../css/Guide.css'; // Custom styles for Guide component

const Guide = () => {
  return (
    <Container className="guide-container mt-5">
      <Row>
        <Col>
          <h2 className="text-center guide-heading">Skill Share Token System Guide</h2>
          <p className="text-center guide-subtitle">Maximize your experience by understanding how to earn, spend, and save tokens.</p>
        </Col>
      </Row>
      
      <Row className="mt-4">
        {/* Earning Tokens */}
        <Col md={6} className="mb-4">
          <Card className="info-card shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaCoins className="info-icon mr-2" />
                <Card.Title className="mb-0">Earning Tokens</Card.Title>
              </div>
              <ul className="list-unstyled">
                <li className="my-2"><strong>100 tokens</strong> for first signup.</li>
                <li className="my-2"><strong>50 tokens</strong> for verifying a skill.</li>
                <li className="my-2"><strong>20 tokens</strong> per interaction using a verified skill.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Spending Tokens */}
        <Col md={6} className="mb-4">
          <Card className="info-card shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaShoppingCart className="info-icon mr-2" />
                <Card.Title className="mb-0">Spending Tokens</Card.Title>
              </div>
              <ul className="list-unstyled">
                <li className="my-2"><strong>20 tokens</strong> to interact with a verified user (Free plan).</li>
                <li className="my-2"><strong>10 tokens</strong> per interaction with a <strong>Premium Subscription</strong>.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        {/* Premium Subscription */}
        <Col className="mb-4">
          <Card className="info-card premium-card shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaCrown className="info-icon mr-2 premium-icon" />
                <Card.Title className="mb-0">Premium Subscription</Card.Title>
              </div>
              <p className="mb-3">Save tokens with the premium plan by spending only <strong>10 tokens</strong> per verified interaction instead of 20.</p>
              <p className="mb-0">Subscription fee: <strong>₹50 per month</strong> or <strong>₹500 per year</strong>.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Guide;
