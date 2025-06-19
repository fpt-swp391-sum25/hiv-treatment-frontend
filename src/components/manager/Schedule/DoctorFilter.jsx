import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import './DoctorFilter.css';

const DoctorFilter = ({ selectedDoctor, onDoctorSelect }) => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    // Mock data cho danh sách bác sĩ
    const mockDoctors = [
      { id: 1, name: "BS. Phát" },
      { id: 2, name: "BS. Sơn"},
      { id: 3, name: "BS. Khiết"}
    ];
    
    setDoctors(mockDoctors);
  }, []);

  const handleDoctorChange = (e) => {
    const value = e.target.value;
    onDoctorSelect(value ? value : null);
  };

  return (
    <Form.Group className="filter-group">
      <Form.Label>Bác sĩ:</Form.Label>
      <Form.Select
        value={selectedDoctor || ''}
        onChange={handleDoctorChange}
        className="filter-select"
      >
        <option value="">Tất cả bác sĩ</option>
        {doctors.map(doctor => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default DoctorFilter;
