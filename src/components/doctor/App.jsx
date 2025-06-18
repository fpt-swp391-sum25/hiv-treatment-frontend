import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppFooter from '../layouts/client/app-footer';
import '../../styles/doctor/DoctorProfile.css';

const DoctorApp = () => {
  return (
    <div className="doctor-app">
      <Container >
        <Outlet />
      </Container>
    </div>
  );
};

export default DoctorApp; 