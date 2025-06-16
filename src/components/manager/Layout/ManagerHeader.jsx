import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

const ManagerHeader = ({ managerName = 'Manager' }) => {
  return (
    <Navbar bg="white" className="border-bottom shadow-sm">
      <Container fluid>
        <Navbar.Brand>
          Chào mừng quản lí {managerName}
        </Navbar.Brand>
        <div className="ms-auto">
          {/* Add any additional header items here */}
        </div>
      </Container>
    </Navbar>
  );
};

export default ManagerHeader;
