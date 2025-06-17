import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppFooter from '../layouts/client/app-footer';
import AdminHeader from '../layouts/admin/admin-header';
import DotorSideBar from './doctor-side-bar';
import '../../styles/doctor/DoctorProfile.css';

const DoctorApp = () => {
  return (
    <div className="doctor-app">
      <Container fluid className="py-4">
        <DotorSideBar/>
        <Outlet />
      </Container>
      <AppFooter />
    </div>
  );
};

export default DoctorApp; 