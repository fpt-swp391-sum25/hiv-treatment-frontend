import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Select, Space, Typography, Spin, Empty, Statistic, Tag, Alert, Input, Tooltip, Divider, DatePicker, Switch, Radio } from 'antd';
import { DownloadOutlined, PrinterOutlined, FileExcelOutlined, DollarCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ExceptionOutlined, FilterOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    Legend, 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    LabelList,
    Cell
} from 'recharts';
import { getPaymentStats, calculateTotalRevenue, formatPaymentDataForExport, exportToExcel, groupPaymentsByType } from '../../../../services/report.service';
import dayjs from 'dayjs';
import { PAYMENT_STATUS, PAYMENT_ACCOUNT, PAYMENT_TYPE } from '../../../../types/report.types';
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
    const [reportType, setReportType] = useState('monthly');
    const [comparisonEnabled, setComparisonEnabled] = useState(false);
    const [comparisonDateRange, setComparisonDateRange] = useState([
        dayjs().subtract(2, 'month').startOf('month'),
        dayjs().subtract(1, 'month').endOf('month')
    ]);
    const [comparisonData, setComparisonData] = useState([]);
    const [selectedDatePreset, setSelectedDatePreset] = useState('all');
    
    // State cho bộ lọc
    const [filters, setFilters] = useState({
        paymentType: 'ALL',
        paymentMethod: 'ALL',
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
        // Gọi hàm callback để cập nhật dateRange ở component cha
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
        
        // Gọi hàm callback để cập nhật dateRange ở component cha
        if (typeof onDateRangeChange === 'function' && start && end) {
            onDateRangeChange([start, end]);
        }
    };

    // Fetch dữ liệu so sánh khi bật tính năng so sánh hoặc thay đổi khoảng thời gian so sánh
    useEffect(() => {
        if (comparisonEnabled && comparisonDateRange[0] && comparisonDateRange[1]) {
            fetchComparisonData();
        } else {
            setComparisonData([]);
        }
    }, [comparisonEnabled, comparisonDateRange]);

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

    // Fetch dữ liệu cho khoảng thời gian so sánh
    const fetchComparisonData = async () => {
        try {
            setLoading(true);
            const completed = await getPaymentStats(PAYMENT_STATUS.COMPLETED);
            
            // Lọc dữ liệu theo khoảng thời gian so sánh
            const filteredData = Array.isArray(completed) 
                ? completed.filter(payment => {
            const paymentDate = dayjs(payment.createdAt);
                    return paymentDate.isAfter(comparisonDateRange[0], 'day') && 
                           paymentDate.isBefore(comparisonDateRange[1], 'day');
                })
                : [];
            
            setComparisonData(filteredData);
        } catch (error) {
            console.error('Error fetching comparison data:', error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const generateReportSummary = () => {
        if (!Array.isArray(paymentData.completed) || paymentData.completed.length === 0) {
            return {
                currentRevenue: 0,
                previousRevenue: 0,
                growth: 0,
                transactionCount: 0,
                averageTransaction: 0
            };
        }

        const totalRevenue = calculateTotalRevenue(paymentData.completed);
        const previousPeriodRevenue = calculatePreviousPeriodRevenue();
        const revenueGrowth = previousPeriodRevenue === 0 ? 0 : 
            ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

        return {
            currentRevenue: totalRevenue,
            previousRevenue: previousPeriodRevenue,
            growth: revenueGrowth,
            transactionCount: paymentData.completed.length,
            averageTransaction: paymentData.completed.length === 0 ? 0 : totalRevenue / paymentData.completed.length
        };
    };

    const calculatePreviousPeriodRevenue = () => {
        if (!comparisonEnabled || comparisonData.length === 0) {
        return 0;
        }
        
        return calculateTotalRevenue(comparisonData);
    };

    const handleExportExcel = () => {
        if (!Array.isArray(paymentData.completed) || paymentData.completed.length === 0) {
            onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
            return;
        }
        const formattedData = formatPaymentDataForExport(paymentData.completed);
        exportToExcel(formattedData, 'BaoCaoTaiChinh');
    };

    const handlePrint = () => {
        window.print();
    };

    const summary = generateReportSummary();

    // Tính toán thống kê - CẬP NHẬT ĐỂ BAO GỒM TẤT CẢ GIAO DỊCH
    const statistics = {
        totalRevenue: calculateTotalRevenue([...paymentData.completed, ...paymentData.pending]), // Bao gồm cả pending
        totalCompleted: paymentData.completed.length,
        totalPending: paymentData.pending.length,
        totalFailed: paymentData.failed.length,
        totalTransactions: paymentData.completed.length + paymentData.pending.length + paymentData.failed.length
    };

    // Dữ liệu cho biểu đồ doanh thu theo phương thức thanh toán - CHỈ TÍNH COMPLETED VÀ PENDING
    const revenueByType = groupPaymentsByType([...paymentData.completed, ...paymentData.pending]);

    // Hàm helper để lấy dữ liệu theo khoảng thời gian
    const getRevenueByPeriod = (data, periodType) => {
        if (!Array.isArray(data) || data.length === 0) return [];

        const groupedData = data.reduce((acc, payment) => {
            const date = dayjs(payment.createdAt || new Date());
            let key = '';

            switch (periodType) {
                case 'daily':
                    key = date.format('DD/MM');
                    break;
                case 'weekly':
                    key = `Tuần ${date.week()} - ${date.format('MM/YYYY')}`;
                    break;
                case 'monthly':
                    key = date.format('MM/YYYY');
                    break;
                case 'quarterly':
                    key = `Q${Math.floor((date.month() / 3)) + 1}/${date.year()}`;
                    break;
                case 'yearly':
                    key = date.format('YYYY');
                    break;
                default:
                    key = date.format('DD/MM/YYYY');
            }

            if (!acc[key]) {
                acc[key] = {
                    period: key,
                    revenue: 0,
                    transactions: 0
                };
            }

            acc[key].revenue += Number(payment.amount) || 0;
            acc[key].transactions += 1;
            return acc;
        }, {});

        return Object.values(groupedData).sort((a, b) => {
            // Sắp xếp theo thời gian
            const getTime = (period) => {
                const [day, month, year] = period.split('/');
                return new Date(year, month - 1, day || 1).getTime();
            };
            return getTime(a.period) - getTime(b.period);
        });
    };
    
    // Kết hợp tất cả giao dịch từ các trạng thái khác nhau và sắp xếp theo ID
    const allPayments = [
        ...paymentData.completed,
        ...paymentData.pending,
        ...paymentData.failed
    ].sort((a, b) => {
        // Sắp xếp theo ID tăng dần
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return idA - idB;
    });

    // Lọc dữ liệu giao dịch theo bộ lọc
    const filteredPayments = allPayments.filter(payment => {
        // Lọc theo loại giao dịch
        if (filters.paymentType !== 'ALL' && payment.type !== filters.paymentType) {
            return false;
        }
        
        // Lọc theo phương thức thanh toán
        if (filters.paymentMethod !== 'ALL' && payment.account !== filters.paymentMethod) {
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
            const patientMatch = payment.patientId && 
                String(payment.patientId).toLowerCase().includes(searchLower);
            
            // Nếu không khớp với bất kỳ trường nào, trả về false để loại bỏ
            if (!(idMatch || descMatch || patientMatch)) {
                return false;
            }
        }
        
        // Lọc theo ngày cụ thể (nếu có)
        if (filters.dateFilter && filters.dateFilter.length === 2) {
            const paymentDate = dayjs(payment.createdAt);
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
            paymentType: 'ALL',
            paymentMethod: 'ALL',
            amountRange: 'ALL',
            status: 'ALL',
            searchText: '',
            dateFilter: null
        });
    };
    
    // Xử lý bật/tắt tính năng so sánh
    const handleComparisonToggle = (checked) => {
        setComparisonEnabled(checked);
        if (checked && (!comparisonDateRange[0] || !comparisonDateRange[1])) {
            // Thiết lập khoảng thời gian mặc định cho so sánh (tháng trước)
            setComparisonDateRange([
                dayjs().subtract(2, 'month').startOf('month'),
                dayjs().subtract(1, 'month').endOf('month')
            ]);
        }
    };
    
    // Xử lý thay đổi khoảng thời gian so sánh
    const handleComparisonDateChange = (dates) => {
        setComparisonDateRange(dates);
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
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: '15%',
                render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
            },
            {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description',
                width: '25%',
            },
            {
                title: 'Phương thức',
                dataIndex: 'account',
                key: 'account',
                width: '15%',
                filters: [
                    { text: 'Thanh toán tại quầy', value: PAYMENT_ACCOUNT.COUNTER },
                    { text: 'Thanh toán online', value: PAYMENT_ACCOUNT.ONLINE },
                    { text: 'Bảo hiểm y tế', value: PAYMENT_ACCOUNT.INSURANCE },
                ],
                onFilter: (value, record) => record.account === value,
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
                                value={filters.paymentType}
                                onChange={value => handleFilterChange('paymentType', value)}
                                style={{ width: 150 }}
                            >
                                <Option value="ALL">Tất cả loại</Option>
                                <Option value={PAYMENT_TYPE.APPOINTMENT}>Khám bệnh</Option>
                                <Option value={PAYMENT_TYPE.TEST}>Xét nghiệm</Option>
                                <Option value={PAYMENT_TYPE.MEDICINE}>Thuốc</Option>
                            </Select>
                            
                            <Select
                                value={filters.paymentMethod}
                                onChange={value => handleFilterChange('paymentMethod', value)}
                                style={{ width: 180 }}
                            >
                                <Option value="ALL">Tất cả phương thức</Option>
                                <Option value={PAYMENT_ACCOUNT.COUNTER}>Thanh toán tại quầy</Option>
                                <Option value={PAYMENT_ACCOUNT.ONLINE}>Thanh toán online</Option>
                                <Option value={PAYMENT_ACCOUNT.INSURANCE}>Bảo hiểm y tế</Option>
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
                        const total = pageData.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={4}>
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
                                    icon={<PrinterOutlined />}
                                    onClick={handlePrint}
                                >
                                    In báo cáo
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
                                <Typography.Text strong>Loại giao dịch</Typography.Text>
                                <Select
                                    value={filters.paymentType}
                                    onChange={value => handleFilterChange('paymentType', value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    <Option value="ALL">Tất cả loại</Option>
                                    <Option value={PAYMENT_TYPE.APPOINTMENT}>Khám bệnh</Option>
                                    <Option value={PAYMENT_TYPE.TEST}>Xét nghiệm</Option>
                                    <Option value={PAYMENT_TYPE.MEDICINE}>Thuốc</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Typography.Text strong>Phương thức thanh toán</Typography.Text>
                                <Select
                                    value={filters.paymentMethod}
                                    onChange={value => handleFilterChange('paymentMethod', value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    <Option value="ALL">Tất cả phương thức</Option>
                                    <Option value={PAYMENT_ACCOUNT.COUNTER}>Thanh toán tại quầy</Option>
                                    <Option value={PAYMENT_ACCOUNT.ONLINE}>Thanh toán online</Option>
                                    <Option value={PAYMENT_ACCOUNT.INSURANCE}>Bảo hiểm y tế</Option>
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