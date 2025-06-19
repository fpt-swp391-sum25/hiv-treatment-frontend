import React from 'react';
import { Form } from 'react-bootstrap';
import { ScheduleStatus } from '../../../types/schedule.types';
import './StatusFilter.css';

const StatusFilter = ({ selectedStatus, onStatusSelect }) => {
    const handleStatusChange = (e) => {
        const value = e.target.value;
        onStatusSelect(value ? value : null);
    };

    return (
        <Form.Group className="filter-group">
            <Form.Label>Trạng thái:</Form.Label>
            <Form.Select
                value={selectedStatus || ''}
                onChange={handleStatusChange}
                className="filter-select"
            >
                <option value="">Tất cả trạng thái</option>
                <option value={ScheduleStatus.AVAILABLE}>Làm việc</option>
                <option value={ScheduleStatus.ON_LEAVE}>Nghỉ phép</option>
            </Form.Select>
        </Form.Group>
    );
};

export default StatusFilter;
