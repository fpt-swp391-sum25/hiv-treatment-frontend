import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết từ Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Biểu đồ hiển thị trạng thái lịch hẹn dạng pie chart
 * Đồng bộ với dữ liệu từ bảng hiệu suất làm việc của bác sĩ
 */
const AppointmentStatusChart = ({ data }) => {
  // Mặc định hoặc xử lý dữ liệu không hợp lệ
  const appointmentData = data || {
    active: 0,        // Đang chờ khám
    examined: 0,      // Đã khám
    consulted: 0,     // Đã tư vấn
    absent: 0         // Không đến
  };

  // Tính tổng số lịch hẹn
  const totalAppointments = 
    (appointmentData.active || 0) + 
    (appointmentData.examined || 0) + 
    (appointmentData.consulted || 0) + 
    (appointmentData.absent || 0);

  // Cấu hình dữ liệu cho biểu đồ - đảm bảo thứ tự trùng khớp với bảng hiệu suất
  const chartData = {
    labels: ['Đang chờ khám', 'Đã khám', 'Tư vấn', 'Không đến'],
    datasets: [
      {
        data: [
          appointmentData.active || 0,      // Đang chờ khám
          appointmentData.examined || 0,     // Đã khám
          appointmentData.consulted || 0,    // Đã tư vấn
          appointmentData.absent || 0        // Không đến
        ],
        backgroundColor: [
          'rgba(250, 173, 20, 0.8)',  // vàng cam - đang chờ khám
          'rgba(82, 196, 26, 0.8)',   // xanh lá - đã khám
          'rgba(24, 144, 255, 0.8)',  // xanh dương - tư vấn
          'rgba(245, 34, 45, 0.8)'    // đỏ - không đến
        ],
        borderColor: [
          'rgba(250, 173, 20, 1)',
          'rgba(82, 196, 26, 1)',
          'rgba(24, 144, 255, 1)',
          'rgba(245, 34, 45, 1)'
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
    <div>
      <div className="total-appointments" style={{ textAlign: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Tổng số lịch hẹn: {totalAppointments}
        </span>
      </div>
      <div style={{ height: 280, position: 'relative' }}>
      <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AppointmentStatusChart; 