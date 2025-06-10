import React from 'react';
import { Card } from 'react-bootstrap';
import '../../styles/doctor/Feedback.css';

const Feedback = ({ doctorId }) => {
  return (
    <div className="feedback-container">
      <Card>
        <Card.Body>
          <h4 className="section-title">Đánh giá từ bệnh nhân</h4>
          <p className="text-muted">Coming soon......</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Feedback; 