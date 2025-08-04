import React, { useState } from 'react';
import { Tabs, DatePicker, Space, Card, Alert, Button, Spin } from 'antd';
import { 
    BarChartOutlined, 
    DollarCircleOutlined,
    FileExcelOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';
import StaffReport from './StaffReport/StaffReport';
import FinancialReport from './FinancialReport/FinancialReport';
import MedicalReport from './MedicalReport/MedicalReport';
import dayjs from 'dayjs';
import { exportToExcel, formatStaffDataForExport, formatPaymentDataForExport, getStaffData, getPaymentStats } from '../../../services/report.service';
import { PAYMENT_STATUS, EXPORT_TYPES } from '../../../types/report.types';
import '../../../styles/manager/Reports.css';

const { RangePicker } = DatePicker;

const Reports = () => {
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]); // Khôi phục mặc định tháng hiện tại
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('staff');
    const [loading, setLoading] = useState(false);

    const handleDateRangeChange = (dates) => {
        // Nếu dates là null và đang ở tab staff, cho phép hiển thị tất cả
        if (!dates && activeTab === 'staff') {
            setDateRange(null);
            setError(null);
            return;
        }
        
        // Nếu dates là null và KHÔNG phải tab staff, set về tháng hiện tại
        if (!dates && activeTab !== 'staff') {
            setDateRange([dayjs().startOf('month'), dayjs()]);
            setError(null);
            return;
        }
        
        // Validate date range
        const [start, end] = dates;
        if (end.diff(start, 'days') > 3650) { // Thay đổi từ 90 ngày thành 10 năm (3650 ngày)
            setError('Khoảng thời gian không được vượt quá 10 năm');
            return;
        }
        setDateRange(dates);
        setError(null);
    };

    const handleError = (error) => {
        setError(error.message);
        setTimeout(() => setError(null), 5000);
    };

    const handleExport = async (type) => {
        setLoading(true);
        try {
            console.log(`Exporting ${activeTab} report as ${type}`);
            
            // Lấy dữ liệu theo loại báo cáo
            let exportData = [];
            let fileName = '';
            
            if (activeTab === 'staff') {
                const staffData = await getStaffData();
                exportData = formatStaffDataForExport(staffData);
                fileName = 'BaoCaoNhanSu';
            } else if (activeTab === 'financial') {
                const payments = await getPaymentStats(PAYMENT_STATUS.COMPLETED);
                exportData = formatPaymentDataForExport(payments);
                fileName = 'BaoCaoTaiChinh';
            }
            
            if (exportData.length === 0) {
                throw new Error('Không có dữ liệu để xuất báo cáo');
            }
            
            // Thêm thông tin ngày xuất báo cáo
            const reportDate = dayjs().format('DD/MM/YYYY HH:mm');
            const reportPeriod = `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`;
            
            // Xuất báo cáo Excel
            if (type === 'excel') {
                // Thêm metadata cho báo cáo
                const reportMetadata = [
                    { 'Tiêu đề': activeTab === 'staff' ? 'BÁO CÁO NHÂN SỰ' : 'BÁO CÁO TÀI CHÍNH' },
                    { 'Thời gian xuất báo cáo': reportDate },
                    { 'Khoảng thời gian báo cáo': reportPeriod },
                    { '': '' } // Dòng trống để ngăn cách
                ];
                
                await exportToExcel([...reportMetadata, ...exportData], fileName);
                setError(null);
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key) => {
        setLoading(true);
        setActiveTab(key);
        setError(null);
        
        // Reset dateRange phù hợp với từng tab
        if (key === 'staff') {
            // Tab nhân sự: mặc định hiển thị tất cả (null)
            setDateRange(null);
        } else {
            // Tab khác: mặc định tháng hiện tại
            setDateRange([dayjs().startOf('month'), dayjs()]);
        }
        
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
            children: <StaffReport dateRange={dateRange} onError={handleError} onDateRangeChange={handleDateRangeChange} />
        },
        {
            key: 'financial',
            label: (
                <span>
                    <DollarCircleOutlined />
                    Báo cáo tài chính
                </span>
            ),
            children: <FinancialReport dateRange={dateRange} onError={handleError} onDateRangeChange={handleDateRangeChange} />
        },
        {
            key: 'medical',
            label: (
                <span>
                    <MedicineBoxOutlined />
                    Báo cáo y tế
                </span>
            ),
            children: <MedicalReport dateRange={dateRange} onError={handleError} onDateRangeChange={handleDateRangeChange} />
        }
    ];

    return (
        <Spin spinning={loading}>
            <div className="reports-container">
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
