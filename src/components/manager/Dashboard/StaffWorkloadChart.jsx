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
 * Biểu đồ hiển thị phân bố khối lượng công việc giữa các nhóm nhân viên
 * @param {Object} props - Props của component
 * @param {Object} props.data - Dữ liệu về khối lượng công việc của nhân viên
 */
const StaffWorkloadChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    if (!data) return;

    // Chuẩn bị dữ liệu cho biểu đồ
    const preparedData = {
      labels: ['Bác sĩ', 'Kỹ thuật viên'],
      datasets: [
        {
          label: 'Số lịch hẹn đã xử lý',
          data: [data.doctorAppointments || 0, data.labTechnicianAppointments || 0],
          backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 159, 64, 0.6)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)'],
          borderWidth: 1,
        },
        {
          label: 'Số lịch hẹn hoàn thành',
          data: [data.doctorCompletedAppointments || 0, data.labTechnicianCompletedAppointments || 0],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
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
          position: 'top',
        },
        title: {
          display: true,
          text: 'Phân bố khối lượng công việc theo nhóm nhân viên',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Số lượng lịch hẹn',
            font: {
              size: 12
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Nhóm nhân viên',
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

  if (!data) {
    return (
      <Card title="Phân bố khối lượng công việc">
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Chưa có dữ liệu khối lượng công việc" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Phân bố khối lượng công việc">
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

export default StaffWorkloadChart; 