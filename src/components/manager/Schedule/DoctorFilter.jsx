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

  const handleDoctorChange = (e) => {
    const value = e.target.value;
    onDoctorSelect(value ? value : null);
  };

  const handleRefreshDoctors = () => {
    fetchDoctors();
  };

  return (
    <Form.Group className="filter-group">
      <Form.Label className="d-flex justify-content-between align-items-center">
        <span>Bác sĩ:</span>
        <button 
          type="button" 
          className="btn btn-sm btn-outline-secondary" 
          onClick={handleRefreshDoctors}
          disabled={loading}
        >
          Làm mới
        </button>
      </Form.Label>
      
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
