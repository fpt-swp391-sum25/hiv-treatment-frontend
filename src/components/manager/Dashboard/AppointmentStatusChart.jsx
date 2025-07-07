import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết từ Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Biểu đồ hiển thị trạng thái lịch hẹn dạng pie chart
 */
const AppointmentStatusChart = ({ data }) => {
  // Mặc định hoặc xử lý dữ liệu không hợp lệ
  const appointmentData = data || { 
    completed: 0, 
    pending: 0, 
    cancelled: 0,
    empty: 0
  };
  
  // Cấu hình dữ liệu cho biểu đồ
  const chartData = {
    labels: ['Đã hoàn thành', 'Đang chờ', 'Đã hủy', 'Còn trống'],
    datasets: [
      {
        data: [
          appointmentData.completed || 0, 
          appointmentData.pending || 0,
          appointmentData.cancelled || 0,
          appointmentData.empty || 0
        ],
        backgroundColor: [
          'rgba(82, 196, 26, 0.8)',  // xanh lá - hoàn thành
          'rgba(250, 173, 20, 0.8)',  // vàng cam - đang chờ
          'rgba(245, 34, 45, 0.8)',   // đỏ - đã hủy
          'rgba(200, 200, 200, 0.8)'  // xám - còn trống
        ],
        borderColor: [
          'rgba(82, 196, 26, 1)',
          'rgba(250, 173, 20, 1)',
          'rgba(245, 34, 45, 1)',
          'rgba(200, 200, 200, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Tùy chọn cho biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: 300, position: 'relative' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default AppointmentStatusChart; 