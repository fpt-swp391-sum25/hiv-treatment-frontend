import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần cần thiết từ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Biểu đồ hiển thị phân bố độ tuổi dạng bar chart
 */
const AgeDistributionChart = ({ data }) => {
  // Mặc định hoặc xử lý dữ liệu không hợp lệ
  const ageGroups = data || {
    'under18': 0,
    '18-30': 0,
    '31-45': 0,
    '46-60': 0,
    'over60': 0
  };
  
  // Labels cho các nhóm tuổi
  const labels = ['Dưới 18', '18-30', '31-45', '46-60', 'Trên 60'];
  
  // Dữ liệu từ ageGroups theo thứ tự labels
  const values = [
    ageGroups.under18 || 0,
    ageGroups['18-30'] || 0,
    ageGroups['31-45'] || 0,
    ageGroups['46-60'] || 0,
    ageGroups.over60 || 0
  ];
  
  // Cấu hình dữ liệu cho biểu đồ
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Số lượng bệnh nhân',
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 50,
      },
    ],
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
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div style={{ height: 300, position: 'relative' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AgeDistributionChart; 