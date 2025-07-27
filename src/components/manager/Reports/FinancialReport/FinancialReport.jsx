import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Select, Space, Typography, Spin, Empty, Statistic, Tag, Alert, Input, Tooltip, Divider, DatePicker, Switch } from 'antd';
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, DollarCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ExceptionOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { getPaymentStats, calculateTotalRevenue, formatPaymentDataForExport, exportToExcel, groupPaymentsByType } from '../../../../services/report.service';
import dayjs from 'dayjs';
import { PAYMENT_STATUS } from '../../../../types/report.types';
import './FinancialReport.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const FinancialReport = ({ dateRange, onError, onDateRangeChange }) => {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({
        completed: [],
        pending: [],
        failed: []
    });
    const [selectedDatePreset, setSelectedDatePreset] = useState('all');
    
    // State cho bộ lọc
    const [filters, setFilters] = useState({
        appointmentType: 'ALL',
        amountRange: 'ALL',
        status: 'ALL',
        searchText: '',
        dateFilter: null
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchPaymentData();
    }, [dateRange]);

    // Xử lý thay đổi khoảng thời gian
    const handleDateRangeChange = (dates) => {
        if (typeof onDateRangeChange === 'function') {
            onDateRangeChange(dates);
        }
    };
    
    // Xử lý thay đổi preset khoảng thời gian
    const handleDatePresetChange = (value) => {
        setSelectedDatePreset(value);
        
        let start, end;
        const today = dayjs();
        
        switch (value) {
            case 'today':
                start = today.startOf('day');
                end = today.endOf('day');
                break;
            case 'yesterday':
                start = today.subtract(1, 'day').startOf('day');
                end = today.subtract(1, 'day').endOf('day');
                break;
            case 'thisWeek':
                start = today.startOf('week');
                end = today.endOf('week');
                break;
            case 'lastWeek':
                start = today.subtract(1, 'week').startOf('week');
                end = today.subtract(1, 'week').endOf('week');
                break;
            case 'thisMonth':
                start = today.startOf('month');
                end = today.endOf('month');
                break;
            case 'lastMonth':
                start = today.subtract(1, 'month').startOf('month');
                end = today.subtract(1, 'month').endOf('month');
                break;
            case 'thisQuarter':
                start = today.startOf('quarter');
                end = today.endOf('quarter');
                break;
            case 'lastQuarter':
                start = today.subtract(1, 'quarter').startOf('quarter');
                end = today.subtract(1, 'quarter').endOf('quarter');
                break;
            case 'thisYear':
                start = today.startOf('year');
                end = today.endOf('year');
                break;
            case 'lastYear':
                start = today.subtract(1, 'year').startOf('year');
                end = today.subtract(1, 'year').endOf('year');
                break;
            default:
                // 'all' - không áp dụng bộ lọc ngày
                start = null;
                end = null;
        }
        
        if (typeof onDateRangeChange === 'function' && start && end) {
            onDateRangeChange([start, end]);
        }
    };

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            const [completed, pending, failed] = await Promise.all([
                getPaymentStats(PAYMENT_STATUS.COMPLETED),
                getPaymentStats(PAYMENT_STATUS.PENDING),
                getPaymentStats(PAYMENT_STATUS.FAILED)
            ]);

            setPaymentData({
                completed: Array.isArray(completed) ? completed : [],
                pending: Array.isArray(pending) ? pending : [],
                failed: Array.isArray(failed) ? failed : []
            });
        } catch (error) {
            console.error('Error fetching payment data:', error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!Array.isArray(paymentData.completed) || paymentData.completed.length === 0) {
            onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
            return;
        }
        const formattedData = formatPaymentDataForExport(paymentData.completed);
        exportToExcel(formattedData, 'BaoCaoTaiChinh');
    };

    // Xuất PDF
    const handleExportPDF = async () => {
        try {
            if (!Array.isArray(paymentData.completed) || paymentData.completed.length === 0) {
                onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
                return;
            }
            
            // Import động jsPDF và jsPDF-autotable để tránh lỗi khi khởi tạo ứng dụng
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            
            const doc = new jsPDF();
            
            // Tiêu đề báo cáo
            const title = 'BÁO CÁO TÀI CHÍNH';
            doc.setFontSize(18);
            doc.text(title, 14, 22);
            
            // Thông tin báo cáo
            const reportDate = dayjs().format('DD/MM/YYYY HH:mm');
            const reportPeriod = dateRange && dateRange.length === 2 
                ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
                : 'Tất cả thời gian';
                
            doc.setFontSize(12);
            doc.text(`Thời gian xuất báo cáo: ${reportDate}`, 14, 32);
            doc.text(`Khoảng thời gian báo cáo: ${reportPeriod}`, 14, 40);
            doc.text(`Tổng doanh thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(statistics.totalRevenue)}`, 14, 48);
            
            // Chuẩn bị dữ liệu cho bảng
            const formattedData = formatPaymentDataForExport(paymentData.completed);
            
            // Tạo bảng dữ liệu
            const headers = Object.keys(formattedData[0]);
            const data = formattedData.map(item => Object.values(item));
            
            autoTable(doc, {
                startY: 56,
                head: [headers],
                body: data,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
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
            const pdfFileName = `BaoCaoTaiChinh_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
            doc.save(pdfFileName);
            
        } catch (error) {
            console.error('Error exporting PDF:', error);
            onError?.(new Error('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.'));
        }
    };

    // Tính toán thống kê - CHỈ TÍNH CÁC GIAO DỊCH ĐÃ THANH TOÁN
    const statistics = {
        totalRevenue: calculateTotalRevenue(paymentData.completed), // Chỉ tính giao dịch đã hoàn thành
        totalCompleted: paymentData.completed.length,
        totalPending: paymentData.pending.length,
        totalFailed: paymentData.failed.length,
        totalTransactions: paymentData.completed.length + paymentData.pending.length + paymentData.failed.length
    };

    // Dữ liệu cho biểu đồ doanh thu theo loại lịch hẹn - CHỈ TÍNH COMPLETED
    const revenueByType = groupPaymentsByType(paymentData.completed);
    
    // Kết hợp tất cả giao dịch từ các trạng thái khác nhau và sắp xếp theo ID
    const allPayments = [
        ...paymentData.completed,
        ...paymentData.pending,
        ...paymentData.failed
    ].sort((a, b) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idA - idB;
    });

    // Lọc dữ liệu giao dịch theo bộ lọc
    const filteredPayments = allPayments.filter(payment => {
        // Lọc theo loại lịch hẹn
        if (filters.appointmentType !== 'ALL' && payment.schedule?.type !== filters.appointmentType) {
            return false;
        }
        
        // Lọc theo khoảng số tiền
        if (filters.amountRange !== 'ALL') {
            const amount = Number(payment.amount) || 0;
            switch (filters.amountRange) {
                case 'LOW':
                    if (amount >= 500000) return false;
                    break;
                case 'MEDIUM':
                    if (amount < 500000 || amount >= 2000000) return false;
                    break;
                case 'HIGH':
                    if (amount < 2000000) return false;
                    break;
            }
        }
        
        // Lọc theo trạng thái
        if (filters.status && filters.status !== 'ALL') {
            if (payment.status !== filters.status) return false;
        }
        
        // Lọc theo từ khóa tìm kiếm
        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            const idMatch = payment.id !== undefined && payment.id !== null && 
                String(payment.id).toLowerCase().includes(searchLower);
            const descMatch = payment.description && 
                payment.description.toLowerCase().includes(searchLower);
            const patientMatch = payment.schedule?.patient?.fullName && 
                payment.schedule.patient.fullName.toLowerCase().includes(searchLower);
            const doctorMatch = payment.schedule?.doctor?.fullName && 
                payment.schedule.doctor.fullName.toLowerCase().includes(searchLower);
            
            // Nếu không khớp với bất kỳ trường nào, trả về false để loại bỏ
            if (!(idMatch || descMatch || patientMatch || doctorMatch)) {
                return false;
            }
        }
        
        // Lọc theo ngày cụ thể (nếu có)
        if (filters.dateFilter && filters.dateFilter.length === 2) {
            const paymentDate = dayjs(payment.time);
            return paymentDate.isAfter(filters.dateFilter[0], 'day') && 
                   paymentDate.isBefore(filters.dateFilter[1], 'day');
        }
        
        return true;
    });
    
    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };
    
    // Reset bộ lọc
    const resetFilters = () => {
        setFilters({
            appointmentType: 'ALL',
            amountRange: 'ALL',
            status: 'ALL',
            searchText: '',
            dateFilter: null
        });
    };

    // Component bảng giao dịch
    const TransactionsTable = () => {
        const columns = [
            {
                title: 'Mã giao dịch',
                dataIndex: 'id',
                key: 'id',
                width: '10%',
                sorter: (a, b) => {
                    const idA = Number(a.id) || 0;
                    const idB = Number(b.id) || 0;
                    return idA - idB;
                },
                defaultSortOrder: 'ascend',
            },
            {
                title: 'Thời gian',
                dataIndex: 'time',
                key: 'time',
                width: '15%',
                render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                sorter: (a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf(),
            },
            {
                title: 'Bệnh nhân',
                key: 'patient',
                width: '15%',
                render: (_, record) => record.schedule?.patient?.fullName || 'N/A',
            },
            {
                title: 'Bác sĩ',
                key: 'doctor',
                width: '15%',
                render: (_, record) => record.schedule?.doctor?.fullName || 'N/A',
            },
            {
                title: 'Loại lịch hẹn',
                key: 'appointmentType',
                width: '15%',
                render: (_, record) => record.schedule?.type || 'N/A',
            },
            {
                title: 'Số tiền',
                dataIndex: 'amount',
                key: 'amount',
                width: '15%',
                render: (amount) => new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0
                }).format(amount || 0),
                sorter: (a, b) => a.amount - b.amount,
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: '15%',
                render: (status) => {
                    let color = 'green';
                    if (status === PAYMENT_STATUS.PENDING) {
                        color = 'gold';
                    } else if (status === PAYMENT_STATUS.FAILED) {
                        color = 'red';
                    }
                    return <Tag color={color}>{status}</Tag>;
                },
                filters: [
                    { text: 'Hoàn thành', value: PAYMENT_STATUS.COMPLETED },
                    { text: 'Đang xử lý', value: PAYMENT_STATUS.PENDING },
                    { text: 'Thất bại', value: PAYMENT_STATUS.FAILED },
                ],
                onFilter: (value, record) => record.status === value,
            }
        ];

        return (
            <Card 
                title={
                    <Space>
                        <span>Danh sách giao dịch</span>
                        <Tag color="blue">{filteredPayments.length} giao dịch</Tag>
                    </Space>
                }
                className="table-card"
                extra={
                    <Space>
                        <Tooltip title="Hiển thị/Ẩn bộ lọc">
                            <Button 
                                icon={<FilterOutlined />} 
                                onClick={() => setShowFilters(!showFilters)}
                                type={showFilters ? "primary" : "default"}
                            >
                                Bộ lọc
                            </Button>
                        </Tooltip>
                        <Search
                            placeholder="Tìm kiếm giao dịch"
                            allowClear
                            value={filters.searchText}
                            onChange={e => handleFilterChange('searchText', e.target.value)}
                            style={{ width: 200 }}
                        />
                    </Space>
                }
            >
                {showFilters && (
                    <div className="filters-container" style={{ marginBottom: 16 }}>
                        <Space wrap>
                            <Select
                                value={filters.appointmentType}
                                onChange={value => handleFilterChange('appointmentType', value)}
                                style={{ width: 180 }}
                            >
                                <Option value="ALL">Tất cả loại lịch hẹn</Option>
                                <Option value="Khám định kỳ">Khám định kỳ</Option>
                                <Option value="Khám theo dõi">Khám theo dõi</Option>
                                <Option value="Xét nghiệm">Xét nghiệm</Option>
                                <Option value="Tư vấn">Tư vấn</Option>
                            </Select>
                            
                            <Select
                                value={filters.amountRange}
                                onChange={value => handleFilterChange('amountRange', value)}
                                style={{ width: 150 }}
                            >
                                <Option value="ALL">Tất cả số tiền</Option>
                                <Option value="LOW">Thấp (&lt;500K)</Option>
                                <Option value="MEDIUM">Trung bình (500K-2M)</Option>
                                <Option value="HIGH">Cao (≥2M)</Option>
                            </Select>
                            
                            <RangePicker
                                value={filters.dateFilter}
                                onChange={dates => handleFilterChange('dateFilter', dates)}
                                format="DD/MM/YYYY"
                                allowClear
                            />
                            
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={resetFilters}
                            >
                                Đặt lại
                            </Button>
                        </Space>
                    </div>
                )}
                
                <Table
                    columns={columns}
                    dataSource={filteredPayments}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng số ${total} giao dịch`
                    }}
                    summary={(pageData) => {
                        // Chỉ tính tổng cho các giao dịch đã hoàn thành
                        const completedPayments = pageData.filter(payment => payment.status === PAYMENT_STATUS.COMPLETED);
                        const total = completedPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={5}>
                                    <strong>Tổng</strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1}>
                                    <strong>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                            minimumFractionDigits: 0
                                        }).format(total)}
                                    </strong>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            </Card>
        );
    };

    return (
        <Spin spinning={loading}>
            <div className="financial-report">
                {/* Tiêu đề và công cụ báo cáo */}
                <Row gutter={[16, 16]} className="report-header">
                    <Col span={16}>
                        <Title level={2}>Báo cáo tài chính</Title>
                        <Text type="secondary">
                            Kỳ báo cáo: {dateRange && dateRange.length === 2 
                                ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
                                : 'Tất cả thời gian'}
                        </Text>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Space>
                            <Button 
                                icon={<FileExcelOutlined />}
                                onClick={handleExportExcel}
                            >
                                Xuất Excel
                            </Button>
                            <Button 
                                icon={<FilePdfOutlined />}
                                onClick={handleExportPDF}
                            >
                                Xuất PDF
                            </Button>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setShowFilters(!showFilters)}
                                type={showFilters ? "primary" : "default"}
                            >
                                Bộ lọc
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Bộ lọc */}
                {showFilters && (
                    <Card className="filters-container">
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Typography.Text strong>Khoảng thời gian</Typography.Text>
                                    <Space>
                                        <RangePicker
                                            value={dateRange}
                                            onChange={handleDateRangeChange}
                                            format="DD/MM/YYYY"
                                            placeholder={['Từ ngày', 'Đến ngày']}
                                            allowClear
                                        />
                                        <Select
                                            value={selectedDatePreset} 
                                            onChange={handleDatePresetChange}
                                            style={{ width: 150 }}
                                        >
                                            <Option value="all">Tất cả thời gian</Option>
                                            <Option value="today">Hôm nay</Option>
                                            <Option value="yesterday">Hôm qua</Option>
                                            <Option value="thisWeek">Tuần này</Option>
                                            <Option value="lastWeek">Tuần trước</Option>
                                            <Option value="thisMonth">Tháng này</Option>
                                            <Option value="lastMonth">Tháng trước</Option>
                                            <Option value="thisQuarter">Quý này</Option>
                                            <Option value="lastQuarter">Quý trước</Option>
                                            <Option value="thisYear">Năm nay</Option>
                                            <Option value="lastYear">Năm trước</Option>
                                        </Select>
                                    </Space>
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Divider style={{ margin: '12px 0' }} />
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Typography.Text strong>Loại lịch hẹn</Typography.Text>
                                <Select
                                    value={filters.appointmentType}
                                    onChange={value => handleFilterChange('appointmentType', value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    <Option value="ALL">Tất cả loại</Option>
                                    <Option value="Khám định kỳ">Khám định kỳ</Option>
                                    <Option value="Khám theo dõi">Khám theo dõi</Option>
                                    <Option value="Xét nghiệm">Xét nghiệm</Option>
                                    <Option value="Tư vấn">Tư vấn</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Typography.Text strong>Khoảng số tiền</Typography.Text>
                                <Select
                                    value={filters.amountRange}
                                    onChange={value => handleFilterChange('amountRange', value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    <Option value="ALL">Tất cả số tiền</Option>
                                    <Option value="LOW">Thấp (&lt;500K)</Option>
                                    <Option value="MEDIUM">Trung bình (500K-2M)</Option>
                                    <Option value="HIGH">Cao (≥2M)</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Typography.Text strong>Trạng thái</Typography.Text>
                                <Select
                                    value={filters.status}
                                    onChange={value => handleFilterChange('status', value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    <Option value="ALL">Tất cả trạng thái</Option>
                                    <Option value={PAYMENT_STATUS.COMPLETED}>Hoàn thành</Option>
                                    <Option value={PAYMENT_STATUS.PENDING}>Đang xử lý</Option>
                                    <Option value={PAYMENT_STATUS.FAILED}>Thất bại</Option>
                                </Select>
                            </Col>
                            <Col span={24} style={{ textAlign: 'right', marginTop: 8 }}>
                                <Space>
                                    <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                                        Đặt lại bộ lọc
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        icon={<FilterOutlined />} 
                                        onClick={() => setShowFilters(false)}
                                    >
                                        Áp dụng
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Card>
                )}

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="statistics-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={statistics.totalRevenue}
                                precision={0}
                                formatter={(value) => new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    minimumFractionDigits: 0
                                }).format(value || 0)}
                                prefix={<DollarCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Giao dịch hoàn thành"
                                value={statistics.totalCompleted}
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Giao dịch đang xử lý"
                                value={statistics.totalPending}
                                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Giao dịch thất bại"
                                value={statistics.totalFailed}
                                prefix={<ExceptionOutlined style={{ color: '#ff4d4f' }} />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Bảng danh sách giao dịch */}
                <TransactionsTable />
            </div>
        </Spin>
    );
};

export default FinancialReport; 