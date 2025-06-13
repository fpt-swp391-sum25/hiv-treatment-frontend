import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './doctors-search-page.css';

// Dùng ảnh từ thư mục public
import defaultDoctorImage from '../../assets/doctor.png';

function DoctorsSearchPage() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    //fetch('/api/doctors')// có data thì gỡ cmt dòng này
    // Lấy dữ liệu giả từ public/api/doctors.json
    fetch('/api/doctors.json')
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((error) => console.error('Lỗi khi tải danh sách bác sĩ:', error));
  }, []);

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    // Scroll to top when the component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (    
    <section className="doctor-section" id="doctors-top">
      <div className="search-container">
        <input
          type="text"
          placeholder="Tìm kiếm bác sĩ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="doctor-grid">
        {filteredDoctors.map((doctor) => (
          <div className="doctor-card" key={doctor.id}>
            <img
              src={doctor.image || defaultDoctorImage}
              alt={`Ảnh bác sĩ ${doctor.name}`}
              className="doctor-avatar"
              onError={(e) => (e.target.src = defaultDoctorImage)}
            />
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p>🕒 {doctor.experience} năm kinh nghiệm</p>
              <p>{doctor.qualifications}</p>
              <Link to="/doctors" className="btn-primary">
                Đặt lịch
              </Link>
            </div>
          </div>
        ))}
      </div>      
    </section>
  );
}

export default DoctorsSearchPage;
