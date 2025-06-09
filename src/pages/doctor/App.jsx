import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorProfile from './DoctorProfile';

const DoctorApp = () => {
  return (
    <Routes>
      <Route path="profile" element={<DoctorProfile />} />
      {/* Add more doctor routes here */}
    </Routes>
  );
};

export default DoctorApp; 