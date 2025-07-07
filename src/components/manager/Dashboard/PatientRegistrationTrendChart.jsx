import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Empty } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Đăng ký các thành phần ChartJS cần thiết
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
 * Biểu đồ hiển thị xu hướng đăng ký bệnh nhân mới theo thời gian
 * @param {Object} props - Props của component
 * @param {Array} props.data - Dữ liệu xu hướng đăng ký bệnh nhân mới theo thời gian
 */
const PatientRegistrationTrendChart = ({ data = [] }) => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Chuẩn bị dữ liệu cho biểu đồ
    const preparedData = {
      labels: data.map(item => item.month || item.label),
      datasets: [
        {
          label: 'Bệnh nhân mới',
          data: data.map(item => item.count || item.value),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };

    // Thiết lập tùy chọn cho biểu đồ
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Xu hướng đăng ký bệnh nhân mới',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Bệnh nhân mới: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Số lượng',
            font: {
              size: 12
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Thời gian',
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
      <Card title="Xu hướng đăng ký bệnh nhân mới">
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Chưa có dữ liệu xu hướng đăng ký" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Xu hướng đăng ký bệnh nhân mới">
      <div style={{ height: '300px' }}>
        {chartData && chartOptions ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty description="Đang tải dữ liệu..." />
          </div>
        )}
      </div>
    </Card>
  );
};

export default PatientRegistrationTrendChart; 