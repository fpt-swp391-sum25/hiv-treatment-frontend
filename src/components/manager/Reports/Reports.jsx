import React, { useState } from 'react';
import { Tabs, DatePicker, Space, Card, Alert, Button, Spin } from 'antd';
import { 
    BarChartOutlined, 
    DollarCircleOutlined,
    FileExcelOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import StaffReport from './StaffReport/StaffReport';
import FinancialReport from './FinancialReport/FinancialReport';
import dayjs from 'dayjs';
import './Reports.css';

const { RangePicker } = DatePicker;

const Reports = () => {
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('staff');
    const [loading, setLoading] = useState(false);

    const handleDateRangeChange = (dates) => {
        if (!dates) {
            setDateRange([dayjs().startOf('month'), dayjs()]);
            return;
        }
        // Validate date range
        const [start, end] = dates;
        if (end.diff(start, 'days') > 90) {
            setError('Khoảng thời gian không được vượt quá 90 ngày');
            return;
        }
        setDateRange(dates);
        setError(null);
    };

    const handleError = (error) => {
        setError(error.message);
        setTimeout(() => setError(null), 5000);
    };

    const handleExport = (type) => {
        setLoading(true);
        try {
            console.log(`Exporting ${activeTab} report as ${type}`);
            // Implement export logic here
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key) => {
        setLoading(true);
        setActiveTab(key);
        setError(null);
        // Simulate tab change loading
        setTimeout(() => setLoading(false), 500);
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
        <Spin spinning={loading}>
            <div className="reports-container">
                <Card className="reports-header">
                    <Space direction="horizontal" size="middle" className="header-content">
                        <div className="header-left">
                            <h2>Báo cáo thống kê</h2>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                format="DD/MM/YYYY"
                                allowClear={false}
                                disabledDate={(current) => {
                                    return current && current > dayjs().endOf('day');
                                }}
                            />
                        </div>
                        <div className="header-right">
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<FileExcelOutlined />}
                                    onClick={() => handleExport('excel')}
                                    loading={loading}
                                >
                                    Xuất Excel
                                </Button>
                                <Button
                                    icon={<PrinterOutlined />}
                                    onClick={() => handleExport('pdf')}
                                    loading={loading}
                                >
                                    Xuất PDF
                                </Button>
                            </Space>
                        </div>
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
                        activeKey={activeTab}
                        items={items}
                        onChange={handleTabChange}
                        className="reports-tabs"
                        size="large"
                    />
                </div>
            </div>
        </Spin>
    );
};

export default Reports;
