import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Table, DatePicker, Spin, Alert, Statistic, Button, Space, message, Radio, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, FileExcelOutlined, FilePdfOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/vi';
import axios from 'axios';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import './FinancialReport.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const SERVICE_LABELS = {
    APPOINTMENT: 'Khám bệnh',
    TEST: 'Xét nghiệm',
    MEDICINE: 'Thuốc'
};

// Extend dayjs with required plugins
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(quarterOfYear);
dayjs.extend(localeData);
dayjs.locale('vi'); // Set locale to Vietnamese

const TREND_VIEWS = {
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter'
};

const getQuarterLabel = (date) => {
    const quarter = date.quarter();
    const year = date.year();
    return `Q${quarter}/${year}`;
};

const getMonthLabel = (date) => {
    const month = date.month() + 1;
    const year = date.year();
    return `T${month}/${year}`;
};

const getWeekLabel = (date) => {
    const week = date.week();
    const year = date.year();
    return `Tuần ${week}/${year}`;
};

// Định nghĩa các preset ranges
const datePresets = [
    { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
    { label: '7 ngày qua', value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
    { label: '30 ngày qua', value: [dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')] },
    { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Quý này', value: [dayjs().startOf('quarter'), dayjs().endOf('quarter')] },
    { label: 'Năm nay', value: [dayjs().startOf('year'), dayjs().endOf('year')] }
];

const FinancialReport = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
    const [reportData, setReportData] = useState({
        overview: {
            totalRevenue: 0,
            totalTransactions: 0,
            totalPending: 0,
            totalCompleted: 0
        },
        revenueByService: {},
        revenueByTime: {},
        transactions: []
    });
    const [trendView, setTrendView] = useState(TREND_VIEWS.WEEK);

    // Fetch data function
    const fetchData = async () => {
        if (!dateRange[0] || !dateRange[1]) return;

        setLoading(true);
        setError(null);
        try {
            const [startDate, endDate] = dateRange;

            // 1. Fetch all payments
            const paymentsResponse = await axios.get('/api/payment');
            const allPayments = paymentsResponse.data;

            // 2. Filter payments by date range
            const filteredPayments = allPayments.filter(payment => {
                const paymentDate = dayjs(payment.createdAt);
                return paymentDate.isAfter(startDate) && paymentDate.isBefore(endDate.add(1, 'day'));
            });

            // 3. Calculate revenue by service type
            const revenueByService = filteredPayments.reduce((acc, payment) => {
                if (payment.status === 'Đã thanh toán') {
                    // Determine service type from description
                    let type = 'OTHER';
                    if (payment.description?.toLowerCase().includes('khám')) {
                        type = 'APPOINTMENT';
                    } else if (payment.description?.toLowerCase().includes('xét nghiệm')) {
                        type = 'TEST';
                    } else if (payment.description?.toLowerCase().includes('thuốc')) {
                        type = 'MEDICINE';
                    }
                    acc[type] = (acc[type] || 0) + payment.amount;
                }
                return acc;
            }, {});

            // 4. Calculate revenue by time
            const revenueByTime = filteredPayments.reduce((acc, payment) => {
                // Use current date for demo since createdAt is not in DB
                const date = dayjs().format('YYYY-MM-DD');
                if (!acc[date]) {
                    acc[date] = {
                        total: 0,
                        byService: {
                            APPOINTMENT: 0,
                            TEST: 0,
                            MEDICINE: 0,
                            OTHER: 0
                        }
                    };
                }
                if (payment.status === 'Đã thanh toán') {
                    acc[date].total += payment.amount;
                    // Determine service type from description
                    let type = 'OTHER';
                    if (payment.description?.toLowerCase().includes('khám')) {
                        type = 'APPOINTMENT';
                    } else if (payment.description?.toLowerCase().includes('xét nghiệm')) {
                        type = 'TEST';
                    } else if (payment.description?.toLowerCase().includes('thuốc')) {
                        type = 'MEDICINE';
                    }
                    acc[date].byService[type] += payment.amount;
                }
                return acc;
            }, {});

            // 5. Set report data
            setReportData({
                overview: {
                    totalRevenue: filteredPayments
                        .filter(p => p.status === 'Đã thanh toán')
                        .reduce((sum, p) => sum + p.amount, 0),
                    totalTransactions: filteredPayments.length,
                    totalPending: filteredPayments.filter(p => ['Chờ thanh toán', 'PENDING'].includes(p.status)).length,
                    totalCompleted: filteredPayments.filter(p => p.status === 'Đã thanh toán').length
                },
                revenueByService,
                revenueByTime,
                transactions: filteredPayments
            });
        } catch (err) {
            setError(err.message);
            console.error('Error fetching financial data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    // Prepare chart data
    const chartData = useMemo(() => {
        // Revenue by service for pie chart
        const pieData = Object.entries(reportData.revenueByService).map(([type, amount]) => ({
            name: SERVICE_LABELS[type] || type,
            value: amount
        }));
        
        // Revenue by time for line chart
        const timeData = Object.entries(reportData.revenueByTime)
            .map(([date, data]) => ({
                date,
                total: data.total,
                ...data.byService
            }))
            .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

        return { pieData, timeData };
    }, [reportData]);

    // Prepare trend data
    const trendData = useMemo(() => {
        const data = reportData.transactions
            .filter(t => t.status === 'Đã thanh toán')
            .map(t => ({
                ...t,
                date: dayjs(t.createdAt || new Date()) // Add fallback for missing createdAt
            }));

        const groupedData = {};

        switch (trendView) {
            case TREND_VIEWS.WEEK:
                // Group by week
                data.forEach(t => {
                    const weekKey = t.date.startOf('week').format('YYYY-MM-DD');
                    if (!groupedData[weekKey]) {
                        groupedData[weekKey] = {
                            period: getWeekLabel(t.date),
                            total: 0,
                            count: 0
                        };
                    }
                    groupedData[weekKey].total += t.amount;
                    groupedData[weekKey].count++;
                });
                break;

            case TREND_VIEWS.MONTH:
                // Group by month
                data.forEach(t => {
                    const monthKey = t.date.format('YYYY-MM');
                    if (!groupedData[monthKey]) {
                        groupedData[monthKey] = {
                            period: getMonthLabel(t.date),
                            total: 0,
                            count: 0
                        };
                    }
                    groupedData[monthKey].total += t.amount;
                    groupedData[monthKey].count++;
                });
                break;

            case TREND_VIEWS.QUARTER:
                // Group by quarter
                data.forEach(t => {
                    const quarterKey = `${t.date.year()}-Q${t.date.quarter()}`;
                    if (!groupedData[quarterKey]) {
                        groupedData[quarterKey] = {
                            period: getQuarterLabel(t.date),
                            total: 0,
                            count: 0
                        };
                    }
                    groupedData[quarterKey].total += t.amount;
                    groupedData[quarterKey].count++;
                });
                break;
        }

        // Convert to array and calculate averages
        return Object.entries(groupedData)
            .map(([key, value]) => ({
                key,
                ...value,
                average: value.count > 0 ? value.total / value.count : 0
            }))
            .sort((a, b) => a.key.localeCompare(b.key));
    }, [reportData.transactions, trendView]);

    // Get trend view label
    const getTrendViewLabel = () => {
        switch (trendView) {
            case TREND_VIEWS.WEEK:
                return 'theo tuần';
            case TREND_VIEWS.MONTH:
                return 'theo tháng';
            case TREND_VIEWS.QUARTER:
                return 'theo quý';
            default:
                return '';
        }
    };

    // Table columns configuration
    const columns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Tài khoản',
            dataIndex: 'account',
            key: 'account',
        },
        {
            title: 'Tên bệnh nhân',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            ellipsis: true,
        },
        // Tạm thời comment lại, sẽ xử lý sau
        // {
        //     title: 'Mã lịch hẹn',
        //     dataIndex: 'schedule_id',
        //     key: 'schedule_id',
        // },
        // {
        //     title: 'Mã thanh toán',
        //     dataIndex: 'payment_ref',
        //     key: 'payment_ref',
        //     render: (text) => text || '-'
        // },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
            }).format(amount),
            sorter: (a, b) => a.amount - b.amount
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusColors = {
                    'Đã thanh toán': '#52c41a',
                    'Chờ thanh toán': '#faad14',
                    'PENDING': '#faad14',
                    'Thất bại': '#f5222d'
                };
                return <span style={{ color: statusColors[status] }}>{status}</span>;
            },
            filters: [
                { text: 'Đã thanh toán', value: 'Đã thanh toán' },
                { text: 'Chờ thanh toán', value: 'Chờ thanh toán' },
                { text: 'PENDING', value: 'PENDING' },
                { text: 'Thất bại', value: 'Thất bại' }
            ],
            onFilter: (value, record) => record.status === value
        }
    ];

    // Export to Excel
    const exportToExcel = () => {
        try {
            const exportData = reportData.transactions.map(item => ({
                'Mã giao dịch': item.id,
                'Tài khoản': item.account,
                'Tên bệnh nhân': item.name,
                'Mô tả': item.description,
                'Số tiền': item.amount,
                'Trạng thái': item.status
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo tài chính');

            // Generate filename with date range
            const startDate = dateRange[0].format('DDMMYYYY');
            const endDate = dateRange[1].format('DDMMYYYY');
            const fileName = `Bao_cao_tai_chinh_${startDate}_${endDate}.xlsx`;

            XLSX.writeFile(wb, fileName);
            message.success('Xuất file Excel thành công!');
        } catch (error) {
            message.error('Có lỗi khi xuất file Excel!');
            console.error('Export Excel error:', error);
        }
    };

    // Export to PDF
    const exportToPDF = async () => {
        try {
            message.loading({ content: 'Đang tạo PDF...', key: 'pdfExport' });
            const element = document.querySelector('.financial-report');
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Generate filename with date range
            const startDate = dateRange[0].format('DDMMYYYY');
            const endDate = dateRange[1].format('DDMMYYYY');
            const fileName = `Bao_cao_tai_chinh_${startDate}_${endDate}.pdf`;

            pdf.save(fileName);
            message.success({ content: 'Xuất file PDF thành công!', key: 'pdfExport' });
        } catch (error) {
            message.error({ content: 'Có lỗi khi xuất file PDF!', key: 'pdfExport' });
            console.error('Export PDF error:', error);
        }
    };

    // Xử lý thay đổi khoảng thời gian
    const handleDateRangeChange = (dates, dateStrings) => {
        if (!dates) {
            message.warning('Vui lòng chọn khoảng thời gian');
            return;
        }

        const [start, end] = dates;
        // Kiểm tra khoảng thời gian hợp lệ
        if (end.diff(start, 'days') > 365) {
            message.warning('Khoảng thời gian không được vượt quá 1 năm');
            return;
        }

        setDateRange(dates);
    };

    // Format hiển thị khoảng thời gian
    const getDateRangeText = () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) return '';
        
        const [start, end] = dateRange;
        if (start.isSame(end, 'day')) {
            return `Ngày ${start.format('DD/MM/YYYY')}`;
        }
        return `Từ ${start.format('DD/MM/YYYY')} đến ${end.format('DD/MM/YYYY')}`;
    };

    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    return (
        <div className="financial-report">
            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    className="mb-4"
                />
            )}

            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    {/* Date Range and Export Controls */}
                    <Col span={24}>
                        <Card>
                            <Space direction="horizontal" size="middle" className="w-100 justify-content-between">
                                <Space>
                                    <RangePicker
                                        ranges={datePresets}
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                        format="DD/MM/YYYY"
                                    />
                                    <Text>{getDateRangeText()}</Text>
                                </Space>
                                <Space>
                                    <Button
                                        icon={<FileExcelOutlined />}
                                        onClick={exportToExcel}
                                    >
                                        Xuất Excel
                                    </Button>
                                    <Button
                                        icon={<FilePdfOutlined />}
                                        onClick={exportToPDF}
                                    >
                                        Xuất PDF
                                    </Button>
                                </Space>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng doanh thu"
                                value={reportData.overview.totalRevenue}
                                precision={0}
                                formatter={(value) => 
                                    new Intl.NumberFormat('vi-VN', { 
                                        style: 'currency', 
                                        currency: 'VND' 
                                    }).format(value)
                                }
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Tổng số giao dịch"
                                value={reportData.overview.totalTransactions}
                                precision={0}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Giao dịch hoàn thành"
                                value={reportData.overview.totalCompleted}
                                suffix={`/ ${reportData.overview.totalTransactions}`}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card>
                            <Statistic
                                title="Giao dịch đang chờ"
                                value={reportData.overview.totalPending}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Phân bố doanh thu theo dịch vụ">
                            <PieChart width={400} height={300}>
                                <Pie
                                    data={chartData.pieData}
                                    cx={200}
                                    cy={150}
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => 
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {chartData.pieData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Xu hướng doanh thu theo thời gian">
                            <LineChart
                                width={500}
                                height={300}
                                data={chartData.timeData}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={(date) => dayjs(date).format('DD/MM')}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={(date) => dayjs(date).format('DD/MM/YYYY')}
                                    formatter={(value) => new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(value)}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#8884d8"
                                    name="Tổng doanh thu"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="APPOINTMENT"
                                    stroke="#82ca9d"
                                    name="Khám bệnh"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="TEST"
                                    stroke="#ffc658"
                                    name="Xét nghiệm"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="MEDICINE"
                                    stroke="#ff7300"
                                    name="Thuốc"
                                />
                            </LineChart>
                        </Card>
                    </Col>
                </Row>

                <Card 
                    title={`Phân tích xu hướng ${getTrendViewLabel()}`}
                    className="trend-analysis-card"
                    extra={
                        <Radio.Group 
                            value={trendView} 
                            onChange={e => setTrendView(e.target.value)}
                            optionType="button"
                            buttonStyle="solid"
                        >
                            <Radio.Button value={TREND_VIEWS.WEEK}>Tuần</Radio.Button>
                            <Radio.Button value={TREND_VIEWS.MONTH}>Tháng</Radio.Button>
                            <Radio.Button value={TREND_VIEWS.QUARTER}>Quý</Radio.Button>
                        </Radio.Group>
                    }
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            {trendData.length > 0 ? (
                                <div style={{ height: 400 }}>
                                    <LineChart
                                        width={800}
                                        height={400}
                                        data={trendData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="period" 
                                            padding={{ left: 30, right: 30 }}
                                        />
                                        <YAxis
                                            tickFormatter={value => 
                                                new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                    notation: 'compact',
                                                    maximumFractionDigits: 1
                                                }).format(value)
                                            }
                                        />
                                        <Tooltip 
                                            formatter={value => 
                                                new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(value)
                                            }
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="total" 
                                            name="Tổng doanh thu"
                                            stroke="#8884d8" 
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="average" 
                                            name="Trung bình/giao dịch"
                                            stroke="#82ca9d" 
                                        />
                                    </LineChart>
                                </div>
                            ) : (
                                <Alert
                                    message="Không có dữ liệu"
                                    description="Không có giao dịch nào trong khoảng thời gian đã chọn"
                                    type="info"
                                    showIcon
                                />
                            )}
                        </Col>
                        <Col span={24}>
                            <Table
                                dataSource={trendData}
                                columns={[
                                    {
                                        title: 'Kỳ',
                                        dataIndex: 'period',
                                        key: 'period'
                                    },
                                    {
                                        title: 'Tổng doanh thu',
                                        dataIndex: 'total',
                                        key: 'total',
                                        render: value => new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(value),
                                        sorter: (a, b) => a.total - b.total
                                    },
                                    {
                                        title: 'Số giao dịch',
                                        dataIndex: 'count',
                                        key: 'count',
                                        sorter: (a, b) => a.count - b.count
                                    },
                                    {
                                        title: 'Trung bình/giao dịch',
                                        dataIndex: 'average',
                                        key: 'average',
                                        render: value => new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(value),
                                        sorter: (a, b) => a.average - b.average
                                    }
                                ]}
                                pagination={false}
                                scroll={{ x: true }}
                            />
                        </Col>
                    </Row>
                </Card>

                <Card title="Chi tiết giao dịch" style={{ marginTop: '16px' }}>
                    <Table
                        columns={columns}
                        dataSource={reportData.transactions}
                        rowKey="id"
                        pagination={{
                            defaultPageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} giao dịch`
                        }}
                    />
                </Card>
            </Spin>
        </div>
    );
};

export default FinancialReport; 