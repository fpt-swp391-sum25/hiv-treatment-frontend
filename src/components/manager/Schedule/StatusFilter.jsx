import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { ScheduleStatus } from '../../../types/schedule.types';
import './StatusFilter.css';

const StatusFilter = ({ selectedStatus, onStatusChange, onReset }) => {
    const statusLabels = {
        [ScheduleStatus.PENDING]: 'Chờ xác nhận',
        [ScheduleStatus.CONFIRMED]: 'Đã xác nhận',
        [ScheduleStatus.CANCELLED]: 'Đã hủy',
        [ScheduleStatus.COMPLETED]: 'Đã hoàn thành',
        [ScheduleStatus.NO_SHOW]: 'Không đến khám'
    };

    return (
        <div className="status-filter d-flex align-items-center">
            <Form.Select 
                value={selectedStatus || ''} 
                onChange={(e) => onStatusChange(e.target.value)}
                className="status-select me-2"
            >
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusLabels).map(([status, label]) => (
                    <option key={status} value={status}>
                        {label}
                    </option>
                ))}
            </Form.Select>
            <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={onReset}
            >
                Đặt lại
            </Button>
        </div>
    );
};

export default StatusFilter;
