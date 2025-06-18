import React from 'react';

export default function ScheduleRow({ time, name, type, note, status }) {
  return (
    <tr>
      <td>{time}</td>
      <td><b>{name}</b></td>
      <td>{type}</td>
      <td>{note}</td>
      <td>
        {status === 'Đã xác nhận' ? (
          <span className="status-confirmed">Đã xác nhận</span>
        ) : (
          <span className="status-pending">Chờ xác nhận</span>
        )}
      </td>
      <td>
        <button className="btn-view">👁 Xem</button>
        <button className="btn-complete">✔ Hoàn thành</button>
      </td>
    </tr>
  );
} 