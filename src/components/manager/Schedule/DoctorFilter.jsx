import React, { useState, useEffect } from 'react';
import { Form, Spinner } from 'react-bootstrap';
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
      console.log('Fetching doctors from API...');
      const response = await fetchAllDoctorsAPI();
      
      console.log('API response for doctors:', response);
      
      // Kiểm tra cả response.data và response trực tiếp (tùy thuộc vào cấu trúc API)
      const doctorsData = response.data || response || [];
      const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
      
      console.log('Doctors data after processing:', doctorsList);
      
      if (doctorsList.length > 0) {
        // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
        const formattedDoctors = doctorsList.map(doctor => {
          // Log để kiểm tra cấu trúc dữ liệu
          console.log('Doctor data structure:', doctor);
          
          return {
            id: doctor.id,
            // Dựa vào hình ảnh bảng users, trường tên là full_name
            name: doctor.full_name || `BS. ${doctor.username || doctor.id}`
          };
        });
        
        console.log('Formatted doctors:', formattedDoctors);
        setDoctors(formattedDoctors);
      } else {
        console.log('No doctor data received');
        setDoctors([]);
        setError('Không có dữ liệu bác sĩ');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (e) => {
    const value = e.target.value;
    onDoctorSelect(value ? value : null);
  };

  return (
    <Form.Group className="filter-group">
      <Form.Label>Bác sĩ:</Form.Label>
      {loading ? (
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Đang tải...</span>
        </div>
      ) : (
        <>
          <Form.Select
            value={selectedDoctor || ''}
            onChange={handleDoctorChange}
            className="filter-select"
            disabled={loading || doctors.length === 0}
          >
            <option value="">Tất cả bác sĩ</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </Form.Select>
          {error && <div className="text-danger mt-1 small">{error}</div>}
          {doctors.length === 0 && !error && (
            <div className="text-info mt-1 small">Không có bác sĩ nào</div>
          )}
        </>
      )}
    </Form.Group>
  );
};

export default DoctorFilter;
