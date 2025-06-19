import DoctorSidebar from '../../components/doctor/layout/DoctorSidebar';
import DoctorHeader from '../../components/doctor/layout/DoctorHeader';
import ScheduleTable from '../../components/doctor/Dashboard/ScheduleTable';

export default function DoctorDashboard() {
  return (    <div className="doctor-layout">
      <DoctorSidebar />
      <div className="doctor-dashboard-main">
        <DoctorHeader />
        <div className="dashboard-content">
          <ScheduleTable />
        </div>
      </div>
    </div>
  );
} 