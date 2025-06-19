import DoctorSidebar from '../../components/doctor/layout/DoctorSidebar';
import DoctorHeader from '../../components/doctor/layout/DoctorHeader';

export default function DoctorDashboard() {
  return (    <div className="doctor-layout">
      <DoctorSidebar />
      <div className="doctor-dashboard-main">
        <DoctorHeader />
        <div className="dashboard-content">
          {/* Nội dung dashboard sẽ được thêm ở đây */}
        </div>
      </div>
    </div>
  );
} 