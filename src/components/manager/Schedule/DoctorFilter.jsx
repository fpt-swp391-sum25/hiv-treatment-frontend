import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Select, Spin } from 'antd';
import './DoctorFilter.css';
import { fetchAllDoctorsAPI } from '../../../services/api.service';

const DoctorFilter = ({ selectedDoctor, onDoctorSelect }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('DoctorFilter: Fetching doctors from API...');
      const response = await fetchAllDoctorsAPI();
      
      console.log('DoctorFilter: API response for doctors:', response);
      
      // Kiểm tra cấu trúc response để xác định nơi chứa dữ liệu
      let doctorsData = [];
      
      if (response && response.data) {
        doctorsData = response.data;
      } else if (response && Array.isArray(response)) {
        doctorsData = response;
      } else if (response) {
        doctorsData = response;
      }
      
      // Đảm bảo doctorsData là một mảng
      const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
      
      console.log('DoctorFilter: Doctors data after processing:', doctorsList);
      
      if (doctorsList.length > 0) {
        // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
        const formattedDoctors = doctorsList.map(doctor => {
          // Log để kiểm tra cấu trúc dữ liệu
          console.log('DoctorFilter: Doctor data structure:', doctor);
          
          // Xử lý các trường hợp khác nhau của cấu trúc dữ liệu
          const id = doctor.id || doctor.userId || doctor.user_id;
          const name = doctor.full_name || doctor.fullName || doctor.name || doctor.username || `BS. ${id}`;
          
          return {
            id: id,
            name: name
          };
        });
        
        console.log('DoctorFilter: Formatted doctors:', formattedDoctors);
        setDoctors(formattedDoctors);
      } else {
        console.log('DoctorFilter: No doctor data received');
        setDoctors([]);
        setError('Không có dữ liệu bác sĩ');
      }
    } catch (error) {
      console.error('DoctorFilter: Error fetching doctors:', error);
      setDoctors([]);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (value) => {
    onDoctorSelect(value ? value : null);
  };

  // Tạo danh sách options cho Select
  const doctorOptions = [
    { value: '', label: 'Tất cả bác sĩ' },
    ...doctors.map(doctor => ({
      value: doctor.id.toString(),
      label: doctor.name
    }))
  ];

  // Hiển thị error nếu có
  const errorMessage = error && (
    <div className="text-danger mt-1 small">{error}</div>
  );

  // Thông báo không có bác sĩ
  const emptyMessage = doctors.length === 0 && !error && (
    <div className="text-info mt-1 small">Không có bác sĩ nào</div>
  );

  return (
    <Form.Group className="filter-group">
      <Form.Label>
        <span>Bác sĩ:</span>
      </Form.Label>
      
      {loading ? (
        <div className="d-flex align-items-center">
          <Spin size="small" className="me-2" />
          <span>Đang tải...</span>
        </div>
      ) : (
        <>
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Tìm kiếm bác sĩ"
            optionFilterProp="label"
            value={selectedDoctor || ''}
            onChange={handleDoctorChange}
            filterOption={(input, option) => 
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={doctorOptions}
            loading={loading}
            disabled={loading || doctors.length === 0}
            notFoundContent="Không tìm thấy bác sĩ"
            className="doctor-select"
          />
          {errorMessage}
          {emptyMessage}
        </>
      )}
    </Form.Group>
  );
};

export default DoctorFilter;
