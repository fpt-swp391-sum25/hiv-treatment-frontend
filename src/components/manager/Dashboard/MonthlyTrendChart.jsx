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
 * Biểu đồ hiển thị xu hướng theo tháng
 */
const MonthlyTrendChart = ({ data = [], title = 'Xu hướng theo tháng' }) => {
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  // Lấy tháng hiện tại
  const currentMonth = new Date().getMonth();
  
  // Tạo nhãn cho 6 tháng gần nhất (tháng hiện tại và 5 tháng trước đó)
  const labels = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12; // Đảm bảo index không âm
    labels.push(monthNames[monthIndex]);
  }
  
  // Chuẩn bị dữ liệu cho biểu đồ
  const getDataForLastSixMonths = (dataArray = []) => {
    // Mảng kết quả cho 6 tháng gần nhất
    const result = [];
    
    // Nếu dữ liệu không phải là mảng hoặc không đủ 12 phần tử, trả về mảng rỗng
    if (!Array.isArray(dataArray) || dataArray.length < 12) {
      return Array(6).fill(0);
    }
    
    // Lấy dữ liệu cho 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Đảm bảo index không âm
      result.push(dataArray[monthIndex] || 0);
    }
    
    return result;
  };
  
  // Xử lý dữ liệu null hoặc undefined
  const safeData = data || Array(12).fill().map(() => ({
    total: 0,
    completed: 0,
    cancelled: 0,
    pending: 0
  }));
  
  // Cấu hình dữ liệu cho biểu đồ
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tổng số',
        data: getDataForLastSixMonths(safeData.map(m => m.total)),
        borderColor: 'rgba(24, 144, 255, 1)',
        backgroundColor: 'rgba(24, 144, 255, 0.2)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Hoàn thành',
        data: getDataForLastSixMonths(safeData.map(m => m.completed)),
        borderColor: 'rgba(82, 196, 26, 1)',
        backgroundColor: 'rgba(82, 196, 26, 0.2)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Hủy',
        data: getDataForLastSixMonths(safeData.map(m => m.cancelled)),
        borderColor: 'rgba(245, 34, 45, 1)',
        backgroundColor: 'rgba(245, 34, 45, 0.2)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Đang chờ',
        data: getDataForLastSixMonths(safeData.map(m => m.pending)),
        borderColor: 'rgba(250, 173, 20, 1)',
        backgroundColor: 'rgba(250, 173, 20, 0.2)',
        tension: 0.4,
        fill: false,
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
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16
        }
      },
    },
  };

  return (
    <div style={{ height: 300, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MonthlyTrendChart; 