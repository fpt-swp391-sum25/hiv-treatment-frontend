import React from 'react';

export default function ScheduleRow({ date, time, name, type, status }) {
  return (
    <tr>
      <td>{date}</td>
      <td>{time}</td>
      <td><b>{name}</b></td>
      <td>{type}</td>
      <td>
        {status === 'Đã xác nhận' ? (
          <span className="status-confirmed">Đã xác nhận</span>
        ) : status === 'Chờ xác nhận' ? (
          <span className="status-pending">Chờ xác nhận</span>
        ) : (
          <span>{status}</span>
        )}
      </td>
      <td>
        <button className="btn-view">👁 Xem</button>
        <button className="btn-complete">✔ Hoàn thành</button>
      </td>
    </tr>
  );
} 