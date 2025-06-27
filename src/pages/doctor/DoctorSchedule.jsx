import React, { useContext, useEffect, useState } from 'react';
import { Select, Card } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import '../../styles/doctor/Schedule.css';
import { fetchScheduleByDoctorIdAPI } from '../../services/api.service';
import { useOutletContext } from "react-router-dom";
import { AuthContext } from '../../components/context/AuthContext';

dayjs.extend(isoWeek);

const { Option } = Select;

const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
const timeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

const getDayIndex = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
};

const ScheduleCalendar = () => {
  const today = dayjs();
  const [schedule, setSchedule] = useState([]);
  const [selectedYear, setSelectedYear] = useState(today.year());
  const [selectedMonth, setSelectedMonth] = useState(today.month());
  const [selectedWeek, setSelectedWeek] = useState(today.isoWeek());

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      const response = await fetchScheduleByDoctorIdAPI(user.id);
      setSchedule(response.data);
    } catch (error) {
      setSchedule([]);
      console.error(error);
    }
  };

  const getWeeksInMonth = (year, month) => {
    const start = dayjs().year(year).month(month).startOf('month').startOf('isoWeek');
    const end = dayjs().year(year).month(month).endOf('month').endOf('isoWeek');
    const weeks = [];
    let current = start;
    while (current.isBefore(end)) {
      weeks.push(current.isoWeek());
      current = current.add(1, 'week');
    }
    return [...new Set(weeks)];
  };

  const weekStart = dayjs().year(selectedYear).isoWeek(selectedWeek).startOf('isoWeek');
  const weekEnd = weekStart.add(6, 'day');

  const calendar = Array(timeSlots.length).fill(null).map(() =>
    Array(7).fill(null).map(() => [])
  );

  (schedule || []).forEach((item) => {
    const itemDate = dayjs(item.date);
    if (itemDate.isAfter(weekStart.subtract(1, 'day')) && itemDate.isBefore(weekEnd.add(1, 'day'))) {
      const time = item.slot.substring(0, 5);
      const row = timeSlots.findIndex((t) => t === time);
      const col = getDayIndex(item.date);
      if (row !== -1 && col !== -1) {
        calendar[row][col].push(item);
      }
    }
  });

  return (
    <div className="calendar-wrapper">
      <div className="controls" style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 120 }}
        >
          {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
            <Option key={year} value={year}>{year}</Option>
          ))}
        </Select>

        <Select
          value={selectedMonth}
          onChange={setSelectedMonth}
          style={{ width: 120 }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i} value={i}>{`Tháng ${i + 1}`}</Option>
          ))}
        </Select>

        <Select
          value={selectedWeek}
          onChange={setSelectedWeek}
          style={{ width: 160 }}
        >
          {getWeeksInMonth(selectedYear, selectedMonth).map((weekNum) => {
            const start = dayjs().year(selectedYear).isoWeek(weekNum).startOf('isoWeek');
            const end = start.add(6, 'day');
            return (
              <Option key={weekNum} value={weekNum}>
                {`${start.format('DD/MM')} - ${end.format('DD/MM')}`}
              </Option>
            );
          })}
        </Select>
      </div>

      <div className="week-range" style={{ marginBottom: 12 }}>
        Tuần: {weekStart.format('DD/MM/YYYY')} - {weekEnd.format('DD/MM/YYYY')}
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-cell time-header"></div>
          {daysOfWeek.map((day, index) => (
            <div key={index} className="calendar-cell day-header">
              {day} <br /> {weekStart.add(index, 'day').format('DD/MM')}
            </div>
          ))}
        </div>

        {timeSlots.map((time, rowIndex) => (
          <div className="calendar-row" key={time}>
            <div className="calendar-cell time-slot">{time}</div>
            {calendar[rowIndex].map((cellSchedules, colIndex) => (
              <div key={colIndex} className="calendar-cell">
                {cellSchedules.map((s, i) => (
                  <Card
                    key={i}
                    size="small"
                    style={{ marginBottom: 4 }}
                  >
                    <div><b>Bệnh nhân:</b> {s.patient?.fullName}</div>
                    <div><b>Loại:</b> {s.type}</div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
