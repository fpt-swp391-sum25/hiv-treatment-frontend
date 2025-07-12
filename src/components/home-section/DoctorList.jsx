import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { message, Spin } from 'antd';
import { fetchDoctorProfileAPI, fetchAccountByRoleAPI } from '../../services/api.service';
import '../../styles/home-section/DoctorList.css';

// Dùng ảnh từ thư mục public
import defaultDoctorImage from '../../assets/doctor.png';

const DoctorList = () => {
  const [doctorAccounts, setDoctorAccounts] = useState([]);
  const [doctorProfiles, setDoctorProfiles] = useState([]);
  const [mergedDoctors, setMergedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      const [accountRes, profileRes] = await Promise.all([
        fetchAccountByRoleAPI("doctor"),
        fetchDoctorProfileAPI()
      ]);

      const doctors = accountRes?.data || [];
      const profiles = profileRes?.data || [];

      setDoctorAccounts(doctors);
      setDoctorProfiles(profiles);

      console.log(doctors)
      console.log(profiles)

      const merged = doctors.map(account => {
        const profile = profiles.find(p => p.doctor.id === account.id);
        return {
          ...account,
          licenseNumber: profile?.licenseNumber || '',
          startYear: profile?.startYear || '',
          qualifications: profile?.qualifications || '',
          biography: profile?.biography || '',
          background: profile?.background || ''
        };
      });

      setMergedDoctors(merged);
    } catch (error) {
      console.error("Lỗi khi tải thông tin bác sĩ:", error);
    } finally {
      setLoading(false);
    }
  };
  // Chỉ hiển thị 4 bác sĩ đầu tiên
  const visibleDoctors = mergedDoctors.slice(0, 4);

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
            {visibleDoctors.map((mergedDoctors) => (
              <div className="doctor-card" key={mergedDoctors.id}>
                <img
                  src={mergedDoctors.image || defaultDoctorImage}
                  alt={`Ảnh bác sĩ ${mergedDoctors.fullName}`}
                  className="doctor-avatar"
                  onError={(e) => (e.target.src = defaultDoctorImage)}
                />
                <div className="doctor-info">
                  <h3>{mergedDoctors.fullName}</h3>
                  <p>
                    🕒 {mergedDoctors.startYear
                      ? `${new Date().getFullYear() - Number(mergedDoctors.startYear)} năm kinh nghiệm`
                      : 'Chưa rõ năm kinh nghiệm'}
                  </p>
                  <p>{mergedDoctors.qualifications}</p>
                  <Link to={`/booking?doctorId=${mergedDoctors.id}`} >
                    <button className="btn-primary">Đặt lịch</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

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

        </>
      )}
    </section>
  )
}

export default DoctorList;
