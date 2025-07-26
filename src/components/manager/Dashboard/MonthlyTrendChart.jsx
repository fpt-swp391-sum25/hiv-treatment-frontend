import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần cần thiết từ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Biểu đồ hiển thị xu hướng theo thời gian cho các loại lịch hẹn
 * @param {Array} data - Dữ liệu lịch hẹn
 * @param {string} title - Tiêu đề biểu đồ
 * @param {string} timeFilter - Loại thời gian (month/quarter/year)
 */
const MonthlyTrendChart = ({ 
  data = [], 
  title = 'Xu hướng lịch hẹn theo thời gian',
  timeFilter = 'month' 
}) => {
  // Định nghĩa tên các tháng
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  // Định nghĩa tên các quý
  const quarterNames = ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'];
  
  // Lấy tháng hiện tại
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Tạo nhãn dựa trên loại thời gian
  const getLabels = () => {
    switch (timeFilter) {
      case 'quarter':
        // Hiển thị 4 quý
        return quarterNames;
        
      case 'year':
        // Hiển thị 6 năm gần nhất
        const yearLabels = [];
        for (let i = 0; i < 6; i++) {
          yearLabels.push(`Năm ${currentYear - 5 + i}`);
        }
        return yearLabels;
        
      case 'month':
      default:
        // Hiển thị tất cả 12 tháng
        return monthNames;
    }
  };
  
  // Xử lý dữ liệu theo loại thời gian
  const getChartData = () => {
    // Nếu không có dữ liệu hoặc dữ liệu không hợp lệ
    if (!Array.isArray(data)) {
      return {
        labels: getLabels(),
        datasets: []
      };
    }
    
    switch (timeFilter) {
      case 'quarter':
        // Dữ liệu theo quý
        return {
          labels: getLabels(),
          datasets: [
            {
              label: 'Khám',
              data: data.map(q => q.examination || 0),
              borderColor: 'rgba(24, 144, 255, 1)',
              backgroundColor: 'rgba(24, 144, 255, 0.2)',
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Tái khám',
              data: data.map(q => q.reExamination || 0),
              borderColor: 'rgba(82, 196, 26, 1)',
              backgroundColor: 'rgba(82, 196, 26, 0.2)',
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Tư vấn',
              data: data.map(q => q.consultation || 0),
              borderColor: 'rgba(250, 173, 20, 1)',
              backgroundColor: 'rgba(250, 173, 20, 0.2)',
              tension: 0.4,
              fill: false,
            }
          ],
        };
        
      case 'year':
        // Dữ liệu theo năm
        return {
          labels: getLabels(),
          datasets: [
            {
              label: 'Khám',
              data: data.map(y => y.examination || 0),
              borderColor: 'rgba(24, 144, 255, 1)',
              backgroundColor: 'rgba(24, 144, 255, 0.2)',
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Tái khám',
              data: data.map(y => y.reExamination || 0),
              borderColor: 'rgba(82, 196, 26, 1)',
              backgroundColor: 'rgba(82, 196, 26, 0.2)',
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Tư vấn',
              data: data.map(y => y.consultation || 0),
              borderColor: 'rgba(250, 173, 20, 1)',
              backgroundColor: 'rgba(250, 173, 20, 0.2)',
              tension: 0.4,
              fill: false,
            }
          ],
        };
        
      case 'month':
      default:
        // Dữ liệu theo tháng (tất cả 12 tháng)
        return {
          labels: getLabels(),
          datasets: [
            {
              label: 'Khám',
              data: Array.isArray(data) && data.length === 12 
                ? data.map(m => m.examination || 0)
                : Array(12).fill(0),
              borderColor: 'rgba(24, 144, 255, 1)',
              backgroundColor: 'rgba(24, 144, 255, 0.2)',
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Tái khám',
              data: Array.isArray(data) && data.length === 12 
                ? data.map(m => m.reExamination || 0)
                : Array(12).fill(0),
              borderColor: 'rgba(82, 196, 26, 1)',
              backgroundColor: 'rgba(82, 196, 26, 0.2)',
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Tư vấn',
              data: Array.isArray(data) && data.length === 12 
                ? data.map(m => m.consultation || 0)
                : Array(12).fill(0),
              borderColor: 'rgba(250, 173, 20, 1)',
              backgroundColor: 'rgba(250, 173, 20, 0.2)',
              tension: 0.4,
              fill: false,
            }
          ],
        };
    }
  };
  
  // Tạo tiêu đề dựa trên loại thời gian
  const getChartTitle = () => {
    switch (timeFilter) {
      case 'quarter':
        return 'Xu hướng lịch hẹn theo quý';
      case 'year':
        return 'Xu hướng lịch hẹn theo năm';
      case 'month':
      default:
        return 'Xu hướng lịch hẹn theo tháng';
    }
  };

  // Tùy chọn cho biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Đảm bảo chỉ hiển thị số nguyên
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: getChartTitle(),
        font: {
          size: 16
        }
      },
    },
  };

  return (
    <div style={{ height: 300, position: 'relative' }}>
      <Line data={getChartData()} options={options} />
    </div>
  );
};

export default MonthlyTrendChart; 