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
 * Biểu đồ hiển thị tỷ lệ lịch hẹn đã được đặt so với tổng số bệnh nhân
 * @param {Object} props - Props của component
 * @param {number} props.totalPatients - Tổng số bệnh nhân
 * @param {number} props.patientsWithAppointments - Số lịch hẹn đã được đặt
 */
const PatientAppointmentRatioChart = ({ totalPatients, patientsWithAppointments }) => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);

  useEffect(() => {
    if (totalPatients === undefined || patientsWithAppointments === undefined) return;

    // Tính số bệnh nhân chưa đặt lịch
    const patientsWithoutAppointments = totalPatients - patientsWithAppointments;
    
    // Chuẩn bị dữ liệu cho biểu đồ
    const preparedData = {
      labels: ['Lịch hẹn đã đặt', 'Chưa có lịch hẹn'],
      datasets: [
        {
          data: [patientsWithAppointments, patientsWithoutAppointments],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)'
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
            text: 'Tỷ lệ lịch hẹn đã đặt',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = totalPatients;
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };

    setChartData(preparedData);
    setChartOptions(options);
  }, [totalPatients, patientsWithAppointments]);

  if (totalPatients === undefined || patientsWithAppointments === undefined) {
    return (
      <Card title="Tỷ lệ lịch hẹn đã đặt">
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="Chưa có dữ liệu lịch hẹn" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Tỷ lệ lịch hẹn đã đặt">
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

export default PatientAppointmentRatioChart; 