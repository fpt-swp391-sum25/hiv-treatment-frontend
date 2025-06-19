import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

const DoctorApp = () => {
  return (
    <div >
      {/* Header có thể thêm sau */}
      <Container >
        <Outlet />
      </Container>
      {/* Footer có thể thêm sau */}
    </div>
  );
};

export default DoctorApp; 