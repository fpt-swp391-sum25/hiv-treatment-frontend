import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const DoctorApp = () => {
  return (
    <div className="doctor-app">
      {/* Header có thể thêm sau */}
      <Container fluid className="py-4">
        <Outlet />
      </Container>
      {/* Footer có thể thêm sau */}
    </div>
  );
};

export default DoctorApp; 