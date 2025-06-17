import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppFooter from '../layouts/client/app-footer';
import AdminHeader from '../layouts/admin/admin-header';
import DotorSideBar from './doctor-side-bar';

const DoctorApp = () => {
  return (
    <div className="doctor-app">
      {/* Header có thể thêm sau */}
      <Container fluid className="py-4">
        <DotorSideBar/>
        <Outlet />
      </Container>
      {<AppFooter />}
    </div>
  );
};

export default DoctorApp; 