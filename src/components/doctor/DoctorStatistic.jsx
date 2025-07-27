import { useContext, useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import '../../styles/doctor/Statistics.css';
import { AuthContext } from '../context/AuthContext';
import { 
    fetchScheduleByDoctorIdAPI 
} from "../../services/schedule.service";
import { Select } from 'antd';


// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, BarElement);

dayjs.extend(quarterOfYear);

const getStartEndOfPeriod = (filter) => {
  const now = dayjs();
  if (filter === 'month') {
    return {
      start: now.startOf('month'),
      end: now.endOf('month'),
    };
  } else if (filter === 'quarter') {
    return {
      start: now.startOf('quarter'),
      end: now.endOf('quarter'),
    };
  } else if (filter === 'year') {
    return {
      start: now.startOf('year'),
      end: now.endOf('year'),
    };
  }
  return { start: now.startOf('month'), end: now.endOf('month') };
};

const Statistic = () => {
  const [activeFilter, setActiveFilter] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1); // 1-12
  const [selectedQuarter, setSelectedQuarter] = useState(dayjs().quarter()); // 1-4
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    uniquePatients: 0,
    newPatients: 0,
    chartLabels: [],
    chartData: [],
    typeLabels: [],
    typeData: [],
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await fetchScheduleByDoctorIdAPI(user.id);
        setSchedules(res.data || []);
      } catch (e) {
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    // Xử lý thống kê khi đổi filter hoặc dữ liệu
    if (!schedules.length) {
      setStats({
        totalAppointments: 0,
        uniquePatients: 0,
        newPatients: 0,
        chartLabels: [],
        chartData: [],
        typeLabels: [],
        typeData: [],
      });
      return;
    }
    let start, end;
    if (activeFilter === 'month') {
      const year = dayjs().year();
      start = dayjs(`${year}-${selectedMonth}-01`).startOf('month');
      end = dayjs(`${year}-${selectedMonth}-01`).endOf('month');
    } else if (activeFilter === 'quarter') {
      const year = dayjs().year();
      start = dayjs().year(year).quarter(selectedQuarter).startOf('quarter');
end = dayjs().year(year).quarter(selectedQuarter).endOf('quarter');
    } else if (activeFilter === 'year') {
      start = dayjs().startOf('year');
      end = dayjs().endOf('year');
    }
    // Lọc lịch trong kỳ
    const filtered = schedules.filter(sch => {
      const d = dayjs(sch.date || sch.createdAt);
      return d.isAfter(start.subtract(1, 'day')) && d.isBefore(end.add(1, 'day'));
    });

    // Tổng số lịch hẹn
    const totalAppointments = filtered.length;
    // Tổng số bệnh nhân duy nhất
    const patientIds = filtered
      .map(sch => sch.patient && sch.patient.id)
      .filter(Boolean);
    const uniquePatients = new Set(patientIds).size;
    // Bệnh nhân mới trong kỳ: bệnh nhân có lịch đầu tiên trong kỳ
    const allPatientFirstSchedule = {};
    schedules.forEach(sch => {
      if (!sch.patient || !sch.patient.id) return;
      const d = dayjs(sch.date || sch.createdAt);
      const pid = sch.patient.id;
      if (!allPatientFirstSchedule[pid] || d.isBefore(allPatientFirstSchedule[pid])) {
        allPatientFirstSchedule[pid] = d;
      }
    });
    const newPatients = Object.values(allPatientFirstSchedule).filter(d => d.isAfter(start.subtract(1, 'day')) && d.isBefore(end.add(1, 'day'))).length;
    // Biểu đồ: group theo ngày trong kỳ
    let chartLabels = [];
    let chartData = [];
    if (activeFilter === 'month') {
      const daysInMonth = end.date();
      chartLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
      chartData = Array(daysInMonth).fill(0);
      filtered.forEach(sch => {
        const d = dayjs(sch.date || sch.createdAt);
        const day = d.date() - 1;
        if (day >= 0 && day < daysInMonth) chartData[day]++;
      });
    } else if (activeFilter === 'quarter') {
      // group theo tháng trong quý
      const months = [start.month(), start.month() + 1, start.month() + 2];
      chartLabels = months.map(m => `Tháng ${m + 1}`);
      chartData = [0, 0, 0];
      filtered.forEach(sch => {
        const d = dayjs(sch.date || sch.createdAt);
        const idx = months.indexOf(d.month());
        if (idx !== -1) chartData[idx]++;
      });
    } else if (activeFilter === 'year') {
      // group theo quý
      chartLabels = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];
      chartData = [0, 0, 0, 0];
      filtered.forEach(sch => {
        const d = dayjs(sch.date || sch.createdAt);
        const quarter = d.quarter() - 1;
        if (quarter >= 0 && quarter < 4) chartData[quarter]++;
      });
    }
    // Phân loại lịch hẹn theo loại (type)
    const typeMap = {};
    filtered.forEach(sch => {
      const type = sch.type || 'Chưa có bệnh nhân đăng ký';
      if (!typeMap[type]) typeMap[type] = 0;
      typeMap[type]++;
    });
    

    
    const typeLabels = Object.keys(typeMap);
    const typeData = Object.values(typeMap);
    

    setStats({
      totalAppointments,
      uniquePatients,
      newPatients,
      chartLabels,
chartData,
      typeLabels,
      typeData,
    });
  }, [schedules, activeFilter, selectedMonth, selectedQuarter]);

  const getLineChartData = () => {
    return {
      labels: stats.chartLabels,
      datasets: [
        {
          label: 'Số lượng lịch hẹn',
          data: stats.chartData,
          borderColor: '#2c7bbf',
          backgroundColor: 'rgba(44, 123, 191, 0.2)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  const getPieChartData = () => ({
    labels: stats.typeLabels,
    datasets: [
      {
        label: 'Số lượng lịch hẹn',
        data: stats.typeData,
        backgroundColor: [
          '#4caf50', '#2c7bbf', '#ff9800', '#e91e63', '#9c27b0', '#607d8b', '#ffc107', '#795548'
        ],
        borderColor: [
          '#388e3c', '#1565c0', '#f57c00', '#ad1457', '#6a1b9a', '#455a64', '#ffa000', '#4e342e'
        ],
        borderWidth: 1,
      },
    ],
  });

  const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Biểu đồ số lượng lịch hẹn',
    },
  },
  scales: {
    y: {
      beginAtZero: true,  // Đảm bảo trục y bắt đầu từ 0
      ticks: {
        stepSize: 5,
        callback: function(value) { // Đảm bảo số nguyên
          return Math.floor(value);
        }
      }
    }
  }
};

  const pieOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },  // Ẩn legend
    title: { display: true, text: 'Phân loại lịch hẹn theo loại' },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
        callback: function(value) { // Đảm bảo số nguyên
          return Math.floor(value);
        }
      }
    }
  }
};

  if (loading) return <div style={{textAlign:'center',marginTop:40}}><Spinner animation="border" /></div>;

  return (
    <div className="statistic-section">
      {/* Filter Buttons - Đặt lên trên cùng */}
      <div className="statistic-filter-group" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Button
          variant={activeFilter === 'month' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveFilter('month')}
        >
          Tháng
        </Button>
        <Button
          variant={activeFilter === 'quarter' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveFilter('quarter')}
        >
          Quý
        </Button>
        <Button
          variant={activeFilter === 'year' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveFilter('year')}
        >
          Năm
        </Button>
        {activeFilter === 'month' && (
          <Select
            style={{ width: 100 }}
            value={selectedMonth}
            onChange={setSelectedMonth}
          >
            {[...Array(12)].map((_, i) => (
<Select.Option key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</Select.Option>
            ))}
          </Select>
        )}
        {activeFilter === 'quarter' && (
          <Select
            style={{ width: 100 }}
            value={selectedQuarter}
            onChange={setSelectedQuarter}
          >
            {[1, 2, 3, 4].map(q => (
              <Select.Option key={q} value={q}>{`Quý ${q}`}</Select.Option>
            ))}
          </Select>
        )}
      </div>
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-title">Tổng số lịch hẹn</div>
          <div className="stat-value">{stats.totalAppointments}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Tổng số bệnh nhân</div>
          <div className="stat-value">{stats.uniquePatients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">
            {activeFilter === 'month' && 'Tổng bệnh nhân mới trong tháng'}
            {activeFilter === 'quarter' && 'Tổng bệnh nhân mới trong quý'}
            {activeFilter === 'year' && 'Tổng bệnh nhân mới trong năm'}
          </div>
          <div className="stat-value">{stats.newPatients}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="line-chart-container">
          <Bar data={getLineChartData()} options={lineOptions} />
        </div>
        <div className="pie-chart-container">
          <Bar data={getPieChartData()} options={pieOptions} />
        </div>
      </div>
    </div>
  );
};

export default Statistic;