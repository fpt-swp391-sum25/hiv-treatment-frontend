import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Card, Empty } from 'antd';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Đăng ký các thành phần ChartJS cần thiết
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

/**
 * Biểu đồ hiển thị phân bố nhân viên theo vai trò
 * @param {Object} props - Props của component
 * @param {Object} props.data - Dữ liệu về số lượng nhân viên theo vai trò
 */
const StaffDistributionChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    if (!data) return;

    // Chuẩn bị dữ liệu cho biểu đồ
    const preparedData = {
      labels: ['Bác sĩ', 'Kỹ thuật viên'],
      datasets: [
        {
          data: [data.totalDoctors || 0, data.totalLabTechnicians || 0],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1,
        }
      ]
    };

    // Thiết lập tùy chọn cho biểu đồ
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Phân bố nhân viên theo vai trò',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    setChartData(preparedData);
    setChartOptions(options);
  }, [data]);

  if (!data) {
    return (
      <Card title="Phân bố nhân viên theo vai trò">
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Chưa có dữ liệu nhân viên" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Phân bố nhân viên theo vai trò">
      <div style={{ height: '300px' }}>
        {chartData && chartOptions ? (
          <Pie data={chartData} options={chartOptions} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="Đang tải dữ liệu..." />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StaffDistributionChart; 