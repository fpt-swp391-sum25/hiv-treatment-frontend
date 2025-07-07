import { useEffect, useState } from "react";
import { Card } from "antd";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchScheduleAPI } from '../../services/api.service';
import dayjs from "dayjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const ScheduleByDayChart = () => {
  const [chartData, setChartData] = useState({ labels: [], data: [] });

  useEffect(() => {
    const loadData = async () => {
      const res = await fetchScheduleAPI();
      const schedules = res.data || [];
      const now = dayjs();
      const daysInMonth = now.daysInMonth();
      const counts = Array(daysInMonth).fill(0);

      schedules.forEach(sch => {
        const date = dayjs(sch.date || sch.createdAt);
        if (date.month() === now.month() && date.year() === now.year()) {
          counts[date.date() - 1]++;
        }
      });

      setChartData({
        labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
        data: counts,
      });
    };
    loadData();
  }, []);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Số lượng lịch hẹn',
        data: chartData.data,
        fill: false,
        borderColor: '#2c7bbf',
        backgroundColor: '#2c7bbf',
        borderWidth: 3,
        pointBorderColor: '#2c7bbf',
        pointBackgroundColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 16, weight: 'bold' },
          color: '#333',
          boxWidth: 30,
          padding: 20,
        },
        align: 'center',
      },
      title: {
        display: true,
        text: 'Biểu đồ số lượng lịch hẹn theo ngày trong tháng',
        font: { size: 20, weight: 'bold' },
        color: '#333',
        align: 'center',
        padding: { top: 20, bottom: 10 },
      },
    },
    scales: {
      x: {
        grid: { color: '#eee' },
        ticks: { font: { size: 15 }, color: '#333' },
      },
      y: {
        grid: { color: '#eee' },
        beginAtZero: true,
        ticks: { font: { size: 15 }, color: '#333' },
      },
    },
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: '0 2px 12px 0 rgba(44,123,191,0.08)',
        padding: 24,
        margin: '0 auto',
        maxWidth: 900,
        background: '#fff',
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Bar data={data} options={options} />
    </Card>
  );
};

export default ScheduleByDayChart; 