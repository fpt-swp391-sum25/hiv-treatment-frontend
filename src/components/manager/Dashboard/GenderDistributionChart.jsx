import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết từ Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Biểu đồ hiển thị phân bố giới tính dạng doughnut
 */
const GenderDistributionChart = ({ data }) => {
  // Mặc định hoặc xử lý dữ liệu không hợp lệ
  const genderData = data || { 
    maleCount: 0, 
    femaleCount: 0, 
    otherCount: 0
  };
  
  // Cấu hình dữ liệu cho biểu đồ
  const chartData = {
    labels: ['Nam', 'Nữ', 'Khác'],
    datasets: [
      {
        data: [
          genderData.maleCount || 0, 
          genderData.femaleCount || 0, 
          genderData.otherCount || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',  // xanh dương - nam
          'rgba(255, 99, 132, 0.8)',   // hồng - nữ
          'rgba(153, 102, 255, 0.8)'  // tím - khác
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Tùy chọn cho biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',  // Tạo lỗ hổng ở giữa để có dạng doughnut
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
  
  // Tính tổng số
  const total = (genderData.maleCount || 0) + 
                (genderData.femaleCount || 0) + 
                (genderData.otherCount || 0);

  return (
    <div style={{ height: 300, position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      {/* Hiển thị tổng số ở giữa biểu đồ */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{total}</div>
        <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Tổng</div>
      </div>
    </div>
  );
};

export default GenderDistributionChart; 