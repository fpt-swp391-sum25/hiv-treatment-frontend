import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import './StatusFilter.css';

const StaffFilter = ({ selectedStaff, onStaffSelect }) => {
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    // Mock data cho danh sách nhân viên
    const mockStaff = [
      { id: 101, name: "Linh" },
      { id: 102, name: "Hà"},
      { id: 103, name: "Thanh"}
    ];
    
    setStaffList(mockStaff);
  }, []);

  const handleStaffChange = (e) => {
    const value = e.target.value;
    onStaffSelect(value ? value : null);
  };

  return (
    <Form.Group className="filter-group">
      <Form.Label>Nhân viên:</Form.Label>
      <Form.Select
        value={selectedStaff || ''}
        onChange={handleStaffChange}
        className="filter-select"
      >
        <option value="">Tất cả nhân viên</option>
        {staffList.map(staff => (
          <option key={staff.id} value={staff.id}>
            {staff.name}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};

export default StaffFilter; 