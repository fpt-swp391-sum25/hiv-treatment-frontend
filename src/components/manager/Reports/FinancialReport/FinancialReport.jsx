import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Select, Space, Typography, Spin, Empty, Statistic, Tag, Alert } from 'antd';
import { DownloadOutlined, PrinterOutlined, FileExcelOutlined, DollarCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, ExceptionOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LabelList } from 'recharts';
import { getPaymentStats, calculateTotalRevenue, formatPaymentDataForExport, exportToExcel, groupPaymentsByType } from '../../../../services/report.service';
import dayjs from 'dayjs';
import { PAYMENT_STATUS } from '../../../../types/report.types';
import './FinancialReport.css';

const { Title, Text } = Typography;
const { Option } = Select;

const FinancialReport = ({ dateRange, onError }) => {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({
        completed: [],
        pending: [],
        failed: []
    });
    const [reportType, setReportType] = useState('monthly');
    const [comparisonEnabled, setComparisonEnabled] = useState(false);

    useEffect(() => {
        fetchPaymentData();
    }, [dateRange]);

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
        // TODO: Implement previous period calculation based on reportType
        return 0;
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

    // Tính toán thống kê
    const statistics = {
        totalRevenue: calculateTotalRevenue(paymentData.completed),
        totalCompleted: paymentData.completed.length,
        totalPending: paymentData.pending.length,
        totalFailed: paymentData.failed.length
    };

    // Dữ liệu cho biểu đồ doanh thu theo phương thức thanh toán
    const revenueByType = groupPaymentsByType(paymentData.completed);

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

    // Component biểu đồ xu hướng doanh thu
    const RevenueTrendChart = () => {
        const data = getRevenueByPeriod(paymentData.completed, reportType);
        
        if (data.length === 0) {
            return <Empty description="Không có dữ liệu doanh thu" />;
        }

        return (
            <Card 
                title={
                    <Space>
                        <span>Xu hướng doanh thu</span>
                        <Select
                            value={reportType}
                            onChange={setReportType}
                            style={{ width: 150 }}
                        >
                            <Option value="daily">Theo ngày</Option>
                            <Option value="weekly">Theo tuần</Option>
                            <Option value="monthly">Theo tháng</Option>
                            <Option value="quarterly">Theo quý</Option>
                            <Option value="yearly">Theo năm</Option>
                        </Select>
                    </Space>
                }
                className="chart-card"
            >
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 70, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="period"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                interval={0}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={(value) => {
                                    if (value >= 1000000000) {
                                        return `${(value / 1000000000).toFixed(1)} Tỷ`;
                                    } else if (value >= 1000000) {
                                        return `${(value / 1000000).toFixed(1)} Tr`;
                                    } else if (value >= 1000) {
                                        return `${(value / 1000).toFixed(1)}K`;
                                    }
                                    return value;
                                }}
                                label={{ 
                                    value: 'Doanh thu', 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    offset: -50,
                                    style: {
                                        fontSize: '14px',
                                        fill: 'rgba(0, 0, 0, 0.85)'
                                    }
                                }}
                                width={60}
                            />
                            <Tooltip
                                formatter={(value) => [
                                    `${new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(value)}`,
                                    'Doanh thu'
                                ]}
                                labelFormatter={(label) => `Kỳ: ${label}`}
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            />
                            <Legend />
                            <Bar
                                dataKey="revenue"
                                name="Doanh thu"
                                fill="#1890ff"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                            >
                                <LabelList
                                    dataKey="revenue"
                                    position="top"
                                    formatter={(value) => {
                                        if (value >= 1000000000) {
                                            return `${(value / 1000000000).toFixed(1)} Tỷ`;
                                        } else if (value >= 1000000) {
                                            return `${(value / 1000000).toFixed(1)} Tr`;
                                        } else if (value >= 1000) {
                                            return `${(value / 1000).toFixed(1)}K`;
                                        }
                                        return value;
                                    }}
                                    style={{ fontSize: 11 }}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={data.reduce((sum, item) => sum + item.revenue, 0)}
                                formatter={(value) => {
                                    const formatter = new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    });
                                    return formatter.format(value);
                                }}
                                prefix={<DollarCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Số giao dịch"
                                value={data.reduce((sum, item) => sum + item.transactions, 0)}
                                suffix="giao dịch"
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title={`Trung bình/${reportType === 'daily' ? 'ngày' : 'kỳ'}`}
                                value={data.reduce((sum, item) => sum + item.revenue, 0) / data.length}
                                formatter={(value) => new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value)}
                                prefix={<DollarCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            </Card>
        );
    };

    // Cấu hình cột cho bảng giao dịch
    const columns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            sorter: (a, b) => a.id - b.id
        },
        {
            title: 'Phương thức',
            dataIndex: 'account',
            key: 'account',
            width: '15%',
            filters: [
                { text: 'Thanh toán tại quầy', value: 'Thanh toán tại quầy' },
                { text: 'Thanh toán online', value: 'Thanh toán online' },
                { text: 'Bảo hiểm y tế', value: 'Bảo hiểm y tế' }
            ],
            onFilter: (value, record) => record.account === value,
            filteredValue: null
        },
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            width: '20%'
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: '25%'
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: '15%',
            render: (amount) => `${Number(amount).toLocaleString('vi-VN')} VNĐ`,
            sorter: (a, b) => a.amount - b.amount
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '15%',
            filters: [
                { text: 'Đã thanh toán', value: PAYMENT_STATUS.COMPLETED },
                { text: 'Chờ thanh toán', value: PAYMENT_STATUS.PENDING },
                { text: 'Thất bại', value: PAYMENT_STATUS.FAILED }
            ],
            onFilter: (value, record) => record.status === value,
            filteredValue: null,
            render: (status) => {
                let color = 'default';
                switch (status) {
                    case PAYMENT_STATUS.COMPLETED:
                        color = 'success';
                        break;
                    case PAYMENT_STATUS.PENDING:
                        color = 'warning';
                        break;
                    case PAYMENT_STATUS.FAILED:
                        color = 'error';
                        break;
                }
                return <Tag color={color}>{status}</Tag>;
            }
        }
    ];

    // Tạo danh sách giao dịch cho bảng
    const allTransactions = [
        ...paymentData.completed,
        ...paymentData.pending,
        ...paymentData.failed
    ].sort((a, b) => a.id - b.id);

    if (loading) {
        return (
            <div className="loading-container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large">
                        <div className="loading-content">
                            <Alert
                                message="Đang tải dữ liệu báo cáo..."
                                description="Vui lòng đợi trong giây lát"
                                type="info"
                            />
                        </div>
                    </Spin>
                </div>
            </div>
        );
    }

    return (
        <div className="financial-report">
            <Spin spinning={loading}>
                <Card className="report-header">
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Title level={4}>Báo cáo tài chính {dayjs(dateRange?.[0]).format('DD/MM/YYYY')} - {dayjs(dateRange?.[1]).format('DD/MM/YYYY')}</Title>
                            </Col>
                            <Col>
                                <Space>
                                    <Select
                                        value={reportType}
                                        onChange={setReportType}
                                        style={{ width: 150 }}
                                    >
                                        <Option value="daily">Hàng ngày</Option>
                                        <Option value="weekly">Hàng tuần</Option>
                                        <Option value="monthly">Hàng tháng</Option>
                                        <Option value="quarterly">Hàng quý</Option>
                                        <Option value="yearly">Hàng năm</Option>
                                    </Select>
                                    <Button 
                                        icon={<FileExcelOutlined />}
                                        onClick={handleExportExcel}
                                        disabled={!paymentData.completed.length}
                                    >
                                        Xuất Excel
                                    </Button>
                                    <Button 
                                        icon={<PrinterOutlined />}
                                        onClick={handlePrint}
                                        disabled={!paymentData.completed.length}
                                    >
                                        In báo cáo
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </Space>
                </Card>

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="statistics-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={statistics.totalRevenue}
                                prefix={<DollarCircleOutlined />}
                                suffix="VNĐ"
                                precision={0}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Đã thanh toán"
                                value={statistics.totalCompleted}
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Chờ thanh toán"
                                value={statistics.totalPending}
                                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Thất bại"
                                value={statistics.totalFailed}
                                prefix={<ExceptionOutlined style={{ color: '#ff4d4f' }} />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ doanh thu theo phương thức thanh toán */}
                <Card title="Doanh thu theo phương thức thanh toán" className="chart-card">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={revenueByType}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                            />
                            <Legend />
                            <Bar dataKey="total" name="Doanh thu" fill="#1890ff" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Biểu đồ xu hướng doanh thu */}
                <RevenueTrendChart />

                {/* Bảng chi tiết giao dịch */}
                <Card title="Chi tiết giao dịch" className="table-card">
                    <Table
                        columns={columns}
                        dataSource={allTransactions}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} giao dịch`
                        }}
                        onChange={(pagination, filters, sorter) => {
                            console.log('Table params:', { pagination, filters, sorter });
                        }}
                    />
                </Card>
            </Spin>
        </div>
    );
};

export default FinancialReport; 