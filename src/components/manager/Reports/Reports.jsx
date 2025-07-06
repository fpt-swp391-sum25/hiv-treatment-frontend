import React, { useState } from 'react';
import { Tabs, DatePicker, Space, Card, Alert } from 'antd';
import { BarChartOutlined, DollarCircleOutlined } from '@ant-design/icons';
import StaffReport from './StaffReport/StaffReport';
import FinancialReport from './FinancialReport/FinancialReport';
import dayjs from 'dayjs';
import './Reports.css';

const { RangePicker } = DatePicker;

const Reports = () => {
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [error, setError] = useState(null);

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleError = (error) => {
        setError(error.message);
    };

    const items = [
        {
            key: 'staff',
            label: (
                <span>
                    <BarChartOutlined />
                    Báo cáo nhân sự
                </span>
            ),
            children: <StaffReport dateRange={dateRange} onError={handleError} />
        },
        {
            key: 'financial',
            label: (
                <span>
                    <DollarCircleOutlined />
                    Báo cáo tài chính
                </span>
            ),
            children: <FinancialReport dateRange={dateRange} onError={handleError} />
        }
    ];

    return (
        <div className="reports-container">
            <Card className="reports-header">
                <Space direction="horizontal" size="middle">
                    <h2>Báo cáo thống kê</h2>
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        allowClear={false}
                    />
                </Space>
            </Card>
            
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    closable
                    onClose={() => setError(null)}
                    className="error-alert"
                />
            )}

            <div className="reports-content">
                <Tabs
                    defaultActiveKey="staff"
                    items={items}
                    className="reports-tabs"
                    size="large"
                    onChange={() => setError(null)}
                />
            </div>
        </div>
    );
};

export default Reports;
