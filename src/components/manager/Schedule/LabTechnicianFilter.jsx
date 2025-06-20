import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import './StatusFilter.css';

const LabTechnicianFilter = ({ selectedLabTechnician, onLabTechnicianSelect }) => {
  const [labTechnicianList, setLabTechnicianList] = useState([]);

  useEffect(() => {
    // Mock data cho danh sách nhân viên
    const mockLabTechnician = [
      { id: 101, name: "Linh" },
      { id: 102, name: "Hà"},
      { id: 103, name: "Thanh"}
    ];
    
    setLabTechnicianList(mockLabTechnician);
  }, []);

  const handleLabTechnicianChange = (e) => {
    const value = e.target.value;
    onLabTechnicianSelect(value ? value : null);
  };

  return (
    <Form.Group className="filter-group">
      <Form.Label>Nhân viên:</Form.Label>
      <Form.Select
        value={selectedLabTechnician || ''}
        onChange={handleLabTechnicianChange}
        className="filter-select"
      >
        <option value="">Tất cả nhân viên</option>
        {labTechnicianList.map(labtechnician => (
          <option key={labtechnician.id} value={labtechnician.id}>
            {labtechnician.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default LabTechnicianFilter; 