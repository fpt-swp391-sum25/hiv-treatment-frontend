import React from 'react';
import { Card } from 'react-bootstrap';
import './Statistics.css';

const Statistics = ({ doctorId }) => {
  return (
    <div className="statistics-container">
      <Card>
        <Card.Body>
          <h4 className="section-title">Thống kê</h4>
          <p className="text-muted">Comming soon......</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Statistics; 