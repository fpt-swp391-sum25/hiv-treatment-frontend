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
import { exportToExcel, formatStaffDataForExport, formatPaymentDataForExport, getStaffData, getPaymentStats } from '../../../services/report.service';
import { PAYMENT_STATUS, EXPORT_TYPES } from '../../../types/report.types';
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
            
            // Xuất báo cáo theo định dạng
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
            } else if (type === 'pdf') {
                // Import động jsPDF và jsPDF-autotable để tránh lỗi khi khởi tạo ứng dụng
                const { default: jsPDF } = await import('jspdf');
                const { default: autoTable } = await import('jspdf-autotable');
                
                const doc = new jsPDF();
                
                // Tiêu đề báo cáo
                const title = activeTab === 'staff' ? 'BÁO CÁO NHÂN SỰ' : 'BÁO CÁO TÀI CHÍNH';
                doc.setFontSize(18);
                doc.text(title, 14, 22);
                
                // Thông tin báo cáo
                doc.setFontSize(12);
                doc.text(`Thời gian xuất báo cáo: ${reportDate}`, 14, 32);
                doc.text(`Khoảng thời gian báo cáo: ${reportPeriod}`, 14, 40);
                
                // Tạo bảng dữ liệu
                const headers = Object.keys(exportData[0]);
                const data = exportData.map(item => Object.values(item));
                
                autoTable(doc, {
                    startY: 50,
                    head: [headers],
                    body: data,
                    theme: 'grid',
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    }
                });
                
                // Lưu file PDF
                const pdfFileName = `${fileName}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
                doc.save(pdfFileName);
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
