import React from 'react';
import { Container } from 'react-bootstrap';
import ManagerSchedule from './Schedule/ManagerSchedule';

const ManagerDashboard = () => {
  return (
    <Container fluid className="p-4">
      <ManagerSchedule />
    </Container>
  );
};

export default ManagerDashboard;
