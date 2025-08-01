import React, { useContext, useEffect, useState } from 'react';
import { Select, Card, Modal, List, Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import '../../styles/doctor/Schedule.css';
import { AuthContext } from '../../components/context/AuthContext';
import { fetchScheduleByDoctorIdAPI } from '../../services/schedule.service';

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

  const [openDetail, setOpenDetail] = useState(false);
  const [cellSchedules, setCellSchedules] = useState([]);

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
  const todayIndex = dayjs().isSame(weekStart, 'week') ? dayjs().day() === 0 ? 6 : dayjs().day() - 1 : -1

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

  const showDetails = (schedulesInCell) => {
    setCellSchedules(schedulesInCell);
    setOpenDetail(true);
  };

  const handlePrevWeek = () => {
    const weeks = getWeeksInMonth(selectedYear, selectedMonth);
    const idx = weeks.indexOf(selectedWeek);

    if (idx > 0) {
      setSelectedWeek(weeks[idx - 1]);
    } else {
      let newMonth = selectedMonth - 1;
      let newYear = selectedYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear = selectedYear - 1;
      }
      const prevWeeks = getWeeksInMonth(newYear, newMonth);
      setSelectedYear(newYear);
      setSelectedMonth(newMonth);
      setSelectedWeek(prevWeeks[prevWeeks.length - 1]);
    }
  };

  const handleNextWeek = () => {
    const weeks = getWeeksInMonth(selectedYear, selectedMonth);
    const idx = weeks.indexOf(selectedWeek);

    if (idx < weeks.length - 1) {
      setSelectedWeek(weeks[idx + 1]);
    } else {
      let newMonth = selectedMonth + 1;
      let newYear = selectedYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = selectedYear + 1;
      }
      const nextWeeks = getWeeksInMonth(newYear, newMonth);
      setSelectedYear(newYear);
      setSelectedMonth(newMonth);
      setSelectedWeek(nextWeeks[0]);
    }
  };

  return (
    <div className="calendar-wrapper">
      <div className="controls" style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 100 }}
        >
          {Array.from({ length: 2065 - 2005 }, (_, i) => 2005 + i).map((year) => (
            <Option key={year} value={year}>{year}</Option>
          ))}
        </Select>

        <Select
          value={selectedMonth}
          onChange={setSelectedMonth}
          style={{ width: 100 }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <Option key={i} value={i}>{`Tháng ${i + 1}`}</Option>
          ))}
        </Select>

        <Tooltip title="Tuần trước">
          <Button icon={<LeftOutlined />} size="small" onClick={handlePrevWeek} />
        </Tooltip>
        <Select
          value={selectedWeek}
          onChange={setSelectedWeek}
          style={{ width: 140 }}
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
        <Tooltip title="Tuần sau">
          <Button icon={<RightOutlined />} size="small" onClick={handleNextWeek} />
        </Tooltip>
      </div>

      <div className="week-range" style={{ marginBottom: 12 }}>
        Tuần: {weekStart.format('DD/MM/YYYY')} - {weekEnd.format('DD/MM/YYYY')}
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-cell time-header"></div>
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className={"calendar-cell day-header" + (index === todayIndex ? " today-header" : "")}
              style={index === todayIndex ? { background: '#ffd666' } : {}}
            >
              {day} <br /> {weekStart.add(index, 'day').format('DD/MM')}
            </div>
          ))}
        </div>

        {timeSlots.map((time, rowIndex) => (
          <div className="calendar-row" key={time}>
            <div className="calendar-cell time-slot">{time}</div>
            {calendar[rowIndex].map((cell, colIndex) => (
              <div key={colIndex} className="calendar-cell">
                {cell.length > 0 && (
                  <Card
                    size="small"
                    className="summary-card"
                    style={{
                      margin: 'auto',
                      marginBottom: 4,
                      cursor: 'pointer',
                      textAlign: "center",
                      background: '#e6f7ff',
                      border: '1.5px solid #91d5ff',
                      borderRadius: 7,
                      fontSize: 13,
                      boxShadow: '0 2px 8px 0 rgba(24,100,171,.07)',
                      padding: '8px 4px',
                      width: '100%',
                      maxWidth: '98%',
                    }}
                    onClick={() => showDetails(cell)}
                  >
                    {(() => {
                      const booked = cell.filter(s => !!s.patient).length;
                      const total = cell.length;
                      return (
                        <span>
                          <b>{booked}</b>/{total}
                        </span>
                      );
                    })()}
                  </Card>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Modal chi tiết lịch hẹn */}
      <Modal
        open={openDetail}
        onCancel={() => setOpenDetail(false)}
        title="Chi tiết các lịch hẹn"
        footer={null}
        width={400}
      >
        {cellSchedules.length === 0 ? (
          <div>Không có dữ liệu</div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={cellSchedules}
            renderItem={(s, i) => (
              <List.Item key={i}
                style={{
                  borderBottom: '1px solid #eee',
                  marginBottom: 0,
                  paddingBottom: 7
                }}
              >
                <div><b>Bệnh nhân:</b> {s.patient?.fullName || '---'}</div>
                <div><b>Loại:</b> {s.type || '---'}</div>
                <div><b>Thời gian:</b> {dayjs(s.date).format('DD/MM/YYYY')} - {s.slot}</div>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default ScheduleCalendar;
