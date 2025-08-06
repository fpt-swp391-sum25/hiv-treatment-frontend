import React, { useState, useEffect, useRef } from 'react';
import { Form, Spinner, InputGroup, Dropdown } from 'react-bootstrap';
import { BsSearch, BsChevronDown } from 'react-icons/bs';
import { fetchAllDoctorsAPI } from '../../../services/user.service';
import '../../../styles/manager/DoctorFilter.css';

const DoctorFilter = ({ selectedDoctor, onDoctorSelect }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Lọc danh sách bác sĩ khi searchText thay đổi
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchText, doctors]);

  // Cập nhật tên bác sĩ được chọn
  useEffect(() => {
    if (selectedDoctor) {
      const doctor = doctors.find(d => d.id.toString() === selectedDoctor.toString());
      setSelectedDoctorName(doctor ? doctor.name : '');
      setSearchText(doctor ? doctor.name : '');
    } else {
      setSelectedDoctorName('');
      setSearchText('');
    }
  }, [selectedDoctor, doctors]);

  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllDoctorsAPI();
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

      if (doctorsList.length > 0) {
        // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
        const formattedDoctors = doctorsList.map(doctor => {
          // Log để kiểm tra cấu trúc dữ liệu

          // Xử lý các trường hợp khác nhau của cấu trúc dữ liệu
          const id = doctor.id || doctor.userId || doctor.user_id;
          const name = doctor.full_name || doctor.fullName || doctor.name || doctor.username || `BS. ${id}`;

          return {
            id: id,
            name: name
          };
        });

        setDoctors(formattedDoctors);
        setFilteredDoctors(formattedDoctors);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
        setError('Không có dữ liệu bác sĩ');
      }
    } catch (error) {
      console.error('DoctorFilter: Error fetching doctors:', error);
      setDoctors([]);
      setFilteredDoctors([]);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctorId, doctorName) => {
    if (doctorId === '') {
      // Chọn "Tất cả bác sĩ"
      setSelectedDoctorName('');
      setSearchText('');
      onDoctorSelect(null);
    } else {
      // Chọn bác sĩ cụ thể
      setSelectedDoctorName(doctorName);
      setSearchText(doctorName);
      onDoctorSelect(doctorId);
    }
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setShowDropdown(true);

    // Nếu xóa hết text, reset selection
    if (value === '') {
      setSelectedDoctorName('');
      onDoctorSelect(null);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="filter-container">
      {/* Ô tìm kiếm và dropdown tích hợp */}
      <div className="doctor-search-dropdown" ref={dropdownRef}>
        <InputGroup>
          <InputGroup.Text>
            <BsSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Tìm kiếm hoặc chọn bác sĩ..."
            value={searchText}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            disabled={loading}
            className="search-input"
          />
          <InputGroup.Text
            className="dropdown-toggle-btn"
            onClick={handleDropdownToggle}
            style={{ cursor: 'pointer' }}
          >
            <BsChevronDown />
          </InputGroup.Text>
        </InputGroup>

        {/* Dropdown menu */}
        {showDropdown && !loading && (
          <div className="dropdown-menu-custom">
            <div
              className={`dropdown-item-custom ${!selectedDoctor ? 'selected' : ''}`}
              onClick={() => handleDoctorSelect('', 'Tất cả bác sĩ')}
            >
              Tất cả bác sĩ
            </div>
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className={`dropdown-item-custom ${selectedDoctor?.toString() === doctor.id?.toString() ? 'selected' : ''}`}
                onClick={() => handleDoctorSelect(doctor.id, doctor.name)}
              >
                {doctor.name}
              </div>
            ))}
            {filteredDoctors.length === 0 && searchText && (
              <div className="dropdown-item-custom disabled">
                Không tìm thấy bác sĩ phù hợp
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="d-flex align-items-center mt-2">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Đang tải...</span>
          </div>
        )}

        {error && <div className="text-danger mt-1 small">{error}</div>}
      </div>
    </div>
  );
};

export default DoctorFilter;
