import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import './doctors-search-page.css';
import { fetchAllDoctorsAPI } from '../../services/api.service';

// Dùng ảnh từ thư mục public
import defaultDoctorImage from '../../assets/doctor.png';

function DoctorsSearchPage() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetchAllDoctorsAPI();
        if (response && response.data) {
          setDoctors(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách bác sĩ:', error);
        message.error('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
        // Fallback to local data if API fails
        fetch('/api/doctors.json')
          .then((res) => res.json())
          .then((data) => setDoctors(data))
          .catch((err) => console.error('Lỗi khi tải dữ liệu local:', err));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
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
        {loading ? (
          <div className="loading-message">Đang tải danh sách bác sĩ...</div>
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
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
                <Link to={`/booking?doctorId=${doctor.id}`} className="btn-primary">
                  Đặt lịch
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">Không tìm thấy bác sĩ nào phù hợp</div>
        )}
      </div>      
    </section>
  );
}

export default DoctorsSearchPage;
