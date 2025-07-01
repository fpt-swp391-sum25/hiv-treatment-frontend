import React from 'react';
import { Form } from 'react-bootstrap';
import { Select } from 'antd';
import './StatusFilter.css';
import { ScheduleStatus } from '../../../types/schedule.types';

const StatusFilter = ({ selectedStatus, onStatusSelect }) => {
    const handleStatusChange = (value) => {
        onStatusSelect(value ? value : null);
    };

    // Tạo danh sách options cho Select
    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: ScheduleStatus.AVAILABLE, label: 'Làm việc' },
        { value: ScheduleStatus.ON_LEAVE, label: 'Nghỉ phép' }
    ];

    return (
        <Form.Group className="filter-group">
            <Form.Label>Trạng thái:</Form.Label>
            <Select
                style={{ width: '100%' }}
                placeholder="Chọn trạng thái"
                value={selectedStatus || ''}
                onChange={handleStatusChange}
                options={statusOptions}
                className="status-select"
            />
        </Form.Group>
    );
};

export default StatusFilter;
