import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../css/Guide.css'; // Import custom styles

const Guide = () => {
  return (
    <Container className="guide-container mt-5">
      <Row>
        <Col>
          <h2 className="text-center">Token System Guide</h2>
          <p className="text-center">Learn how to earn, spend, and save tokens in Skill Share.</p>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title>Earning Tokens</Card.Title>
              <ul>
                <li><strong>100 tokens</strong> on first signup.</li>
                <li><strong>50 tokens</strong> on verifying a skill.</li>
                <li><strong>20 tokens</strong> for each interaction if the skill used is verified.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="info-card">
            <Card.Body>
              <Card.Title>Spending Tokens</Card.Title>
              <ul>
                <li><strong>20 tokens</strong> to interact with a verified user (Free plan).</li>
                <li><strong>10 tokens</strong> if you're a <strong>premium subscriber</strong> (Monthly ₹50 or Yearly ₹500).</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col>
          <Card className="info-card">
            <Card.Body>
              <Card.Title>Premium Subscription</Card.Title>
              <p>With the premium plan, you'll enjoy the benefit of saving tokens by spending only <strong>10 tokens</strong> per verified interaction instead of 20.</p>
              <p>The premium subscription costs <strong>₹50 per month</strong> or <strong>₹500 per year</strong>.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Guide;
