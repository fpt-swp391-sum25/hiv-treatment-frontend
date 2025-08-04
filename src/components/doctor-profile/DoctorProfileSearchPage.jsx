import {
  useState,
  useEffect
} from 'react';
import {
  Link
} from 'react-router-dom';
import '../../styles/doctor-profile/DoctorProfileSearchPage.css';
import defaultDoctorImage from '../../assets/doctor.png';
import {
  fetchDoctorProfileAPI
} from '../../services/doctorProfile.service';
import {
  fetchAccountByRoleAPI
} from '../../services/user.service';

const DoctorsSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
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

  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Filter doctors based on search term
  const filteredDoctors = mergedDoctors.filter((doctors) =>
    normalizeString(doctors.fullName).includes(normalizeString(searchTerm))
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
          filteredDoctors.map((mergedDoctors) => (
            <div className="doctor-card" key={mergedDoctors.id}>
              <img
                src={mergedDoctors.avatar || defaultDoctorImage}
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
                <Link to={`/booking?doctorId=${mergedDoctors.id}`} className="btn-primary">
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
};
export default DoctorsSearchPage;
