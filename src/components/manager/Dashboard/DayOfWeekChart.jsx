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
 * Biểu đồ hiển thị lịch hẹn theo ngày trong tuần
 */
const DayOfWeekChart = ({ data }) => {
  // Mặc định hoặc xử lý dữ liệu không hợp lệ
  const defaultData = [
    { day: 'Sunday', dayName: 'Chủ nhật', count: 0 },
    { day: 'Monday', dayName: 'Thứ 2', count: 0 },
    { day: 'Tuesday', dayName: 'Thứ 3', count: 0 },
    { day: 'Wednesday', dayName: 'Thứ 4', count: 0 },
    { day: 'Thursday', dayName: 'Thứ 5', count: 0 },
    { day: 'Friday', dayName: 'Thứ 6', count: 0 },
    { day: 'Saturday', dayName: 'Thứ 7', count: 0 },
  ];
  
  // Sử dụng dữ liệu từ props hoặc dữ liệu mặc định
  const dayData = Array.isArray(data) ? data : defaultData;
  
  // Lấy nhãn và dữ liệu
  const labels = dayData.map(item => item.dayName);
  const counts = dayData.map(item => item.count);
  
  // Cấu hình dữ liệu cho biểu đồ
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Số lịch hẹn',
        data: counts,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)', // Thứ 2
          'rgba(75, 192, 192, 0.7)', // Thứ 3
          'rgba(153, 102, 255, 0.7)', // Thứ 4
          'rgba(255, 159, 64, 0.7)', // Thứ 5
          'rgba(255, 99, 132, 0.7)', // Thứ 6
          'rgba(255, 205, 86, 0.7)', // Thứ 7
          'rgba(201, 203, 207, 0.7)', // CN
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 40,
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
        display: false, // Ẩn legend vì chỉ có 1 dataset
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

export default DayOfWeekChart; 