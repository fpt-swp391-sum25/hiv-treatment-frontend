import { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import '../../styles/doctor/Statistics.css';
import { AuthContext } from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const Statistic = () => {
  const [activeFilter, setActiveFilter] = useState('month');
  const [statsData, setStatsData] = useState({
    totalPatients: 150,
    newPatients: 12,
    consultations: 45
  });

  const { user } = useContext(AuthContext)


  // Mock data for charts
  const getLineChartData = (filter) => {
    let labels = [];
    let data = [];

    switch (filter) {
      case 'month':
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        data = [12, 19, 15, 8];
        break;
      case 'quarter':
        labels = ['Tháng 1', 'Tháng 2', 'Tháng 3'];
        data = [35, 42, 38];
        break;
      case 'year':
        labels = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];
        data = [85, 95, 78, 92];
        break;
      default:
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        data = [12, 19, 15, 8];
    }

    return {
      labels,
      datasets: [
        {
          label: 'Số lượng bệnh nhân',
          data,
          borderColor: '#2c7bbf',
          backgroundColor: 'rgba(44, 123, 191, 0.2)',
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  const getPieChartData = (filter) => {
    let data = [];

    switch (filter) {
      case 'month':
        data = [65, 25, 10];
        break;
      case 'quarter':
        data = [55, 30, 15];
        break;
      case 'year':
        data = [50, 35, 15];
        break;
      default:
        data = [65, 25, 10];
    }

    return {
      labels: ['Đã khỏi', 'Đang điều trị', 'Mới'],
      datasets: [
        {
          data,
          backgroundColor: [
            '#4caf50',
            '#2c7bbf',
            '#ff9800',
          ],
          borderColor: [
            '#388e3c',
            '#1565c0',
            '#f57c00',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Biểu đồ số lượng bệnh nhân',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Phân loại bệnh nhân',
      },
    },
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);

    // Update stats data based on filter
    switch (filter) {
      case 'month':
        setStatsData({
          totalPatients: 150,
          newPatients: 12,
          consultations: 45
        });
        break;
      case 'quarter':
        setStatsData({
          totalPatients: 450,
          newPatients: 35,
          consultations: 120
        });
        break;
      case 'year':
        setStatsData({
          totalPatients: 1800,
          newPatients: 150,
          consultations: 520
        });
        break;
      default:
        setStatsData({
          totalPatients: 150,
          newPatients: 12,
          consultations: 45
        });
    }
  };

  return (
    <div className="statistics-container">
      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-title">Tổng số bệnh nhân</div>
          <div className="stat-value">{statsData.totalPatients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Bệnh nhân mới trong kỳ</div>
          <div className="stat-value">{statsData.newPatients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Buổi tư vấn trong kỳ</div>
          <div className="stat-value">{statsData.consultations}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="line-chart-container">
          <Line data={getLineChartData(activeFilter)} options={lineOptions} />
        </div>
        <div className="pie-chart-container">
          <Pie data={getPieChartData(activeFilter)} options={pieOptions} />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-container">
        <Button
          variant={activeFilter === 'month' ? 'primary' : 'outline-primary'}
          onClick={() => handleFilterChange('month')}
          className="filter-btn"
        >
          Tháng
        </Button>
        <Button
          variant={activeFilter === 'quarter' ? 'primary' : 'outline-primary'}
          onClick={() => handleFilterChange('quarter')}
          className="filter-btn"
        >
          Quý
        </Button>
        <Button
          variant={activeFilter === 'year' ? 'primary' : 'outline-primary'}
          onClick={() => handleFilterChange('year')}
          className="filter-btn"
        >
          Năm
        </Button>
      </div>
    </div>
  );
};

export default Statistic;