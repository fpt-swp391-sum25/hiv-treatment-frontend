import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, Empty } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Đăng ký các thành phần ChartJS cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Biểu đồ hiển thị hiệu suất của nhân viên (bác sĩ)
 * @param {Object} props - Props của component
 * @param {Array} props.data - Dữ liệu về hiệu suất của các bác sĩ
 */
const StaffPerformanceChart = ({ data = [] }) => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Lấy top 5 bác sĩ theo hiệu suất
    const topDoctors = [...data]
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);

    // Chuẩn bị dữ liệu cho biểu đồ
    const preparedData = {
      labels: topDoctors.map(doctor => doctor.name || `BS. ${doctor.id}`),
      datasets: [
        {
          label: 'Hiệu suất (%)',
          data: topDoctors.map(doctor => doctor.performance || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }
      ]
    };

    // Thiết lập tùy chọn cho biểu đồ
    const options = {
      indexAxis: 'y', // Để tạo biểu đồ ngang
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Top 5 bác sĩ theo hiệu suất',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Hiệu suất: ${context.raw}%`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Hiệu suất (%)',
            font: {
              size: 12
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Bác sĩ',
            font: {
              size: 12
            }
          }
        }
      }
    };

    setChartData(preparedData);
    setChartOptions(options);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card title="Hiệu suất bác sĩ">
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Chưa có dữ liệu hiệu suất" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Hiệu suất bác sĩ">
      <div style={{ height: '300px' }}>
        {chartData && chartOptions ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="Đang tải dữ liệu..." />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StaffPerformanceChart; 