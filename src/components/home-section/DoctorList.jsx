import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { message, Spin } from 'antd';
import { fetchAllDoctorsAPI } from '../../services/api.service';
import './DoctorList.css';

// Dùng ảnh từ thư mục public
import defaultDoctorImage from '../../assets/doctor.png';

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
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
        message.error('Không thể tải danh sách bác sĩ');
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

  // Chỉ hiển thị 4 bác sĩ đầu tiên
  const visibleDoctors = doctors.slice(0, 4);

  return (    
    <section className="doctor-section" id="doctor-section">
      <h2 className="title">
        Đội ngũ <span className="highlight">bác sĩ chuyên khoa</span>
      </h2>
      <p className="subtitle">
        Các bác sĩ của chúng tôi đều là những chuyên gia hàng đầu trong lĩnh vực điều trị HIV với nhiều năm kinh nghiệm và được đào tạo bài bản quốc tế.
      </p>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải danh sách bác sĩ...</p>
        </div>
      ) : (
        <>
          <div className="doctor-grid">
            {visibleDoctors.map((doctor) => (
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
            ))}
          </div>
          
          {doctors.length > 4 && (
            <div className="view-all-container">
              <Link 
                to="/doctors" 
                className="btn-outline"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Xem tất cả bác sĩ
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DoctorList;
