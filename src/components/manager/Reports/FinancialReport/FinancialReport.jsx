import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Select, Space, Typography, Spin, Empty } from 'antd';
import { DownloadOutlined, PrinterOutlined, FileExcelOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPaymentStats, calculateTotalRevenue, formatPaymentDataForExport, exportToExcel } from '../../../../services/report.service';
import dayjs from 'dayjs';
import './FinancialReport.css';

const { Title, Text } = Typography;
const { Option } = Select;

const FinancialReport = ({ dateRange, onError }) => {
    const [paymentData, setPaymentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('monthly');
    const [comparisonEnabled, setComparisonEnabled] = useState(false);

    useEffect(() => {
        fetchData();
    }, [dateRange, reportType]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getPaymentStats();
            // Đảm bảo response.data là một mảng
            const data = Array.isArray(response) ? response : [];
            const filteredData = filterDataByDateRange(data, dateRange);
            setPaymentData(filteredData);
        } catch (error) {
            console.error('Error fetching payment data:', error);
            onError?.(error);
            setPaymentData([]); // Set empty array instead of null
        } finally {
            setLoading(false);
        }
    };

    const filterDataByDateRange = (data, range) => {
        if (!range || !Array.isArray(data)) return [];
        return data.filter(payment => {
            const paymentDate = dayjs(payment.createdAt);
            return paymentDate.isAfter(range[0]) && paymentDate.isBefore(range[1]);
        });
    };

    const generateReportSummary = () => {
        if (!Array.isArray(paymentData) || paymentData.length === 0) {
            return {
                currentRevenue: 0,
                previousRevenue: 0,
                growth: 0,
                transactionCount: 0,
                averageTransaction: 0
            };
        }

        const totalRevenue = calculateTotalRevenue(paymentData);
        const previousPeriodRevenue = calculatePreviousPeriodRevenue();
        const revenueGrowth = previousPeriodRevenue === 0 ? 0 : 
            ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;

        return {
            currentRevenue: totalRevenue,
            previousRevenue: previousPeriodRevenue,
            growth: revenueGrowth,
            transactionCount: paymentData.length,
            averageTransaction: paymentData.length === 0 ? 0 : totalRevenue / paymentData.length
        };
    };

    const calculatePreviousPeriodRevenue = () => {
        // TODO: Implement previous period calculation based on reportType
        return 0;
    };

    const handleExportExcel = () => {
        if (!Array.isArray(paymentData) || paymentData.length === 0) {
            onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
            return;
        }
        const formattedData = formatPaymentDataForExport(paymentData);
        exportToExcel(formattedData, 'BaoCaoTaiChinh');
    };

    const handlePrint = () => {
        window.print();
    };

    const summary = generateReportSummary();

    const columns = [
        {
            title: 'Chỉ số',
            dataIndex: 'metric',
            key: 'metric',
        },
        {
            title: 'Kỳ này',
            dataIndex: 'current',
            key: 'current',
            render: (value) => `${value.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Kỳ trước',
            dataIndex: 'previous',
            key: 'previous',
            render: (value) => `${value.toLocaleString('vi-VN')} VNĐ`
        },
        {
            title: 'Thay đổi',
            dataIndex: 'change',
            key: 'change',
            render: (value) => (
                <Text type={value > 0 ? 'success' : 'danger'}>
                    {value > 0 ? '+' : ''}{value.toFixed(2)}%
                </Text>
            )
        }
    ];

    const reportData = [
        {
            metric: 'Tổng doanh thu',
            current: summary.currentRevenue,
            previous: summary.previousRevenue,
            change: summary.growth
        },
        {
            metric: 'Giao dịch trung bình',
            current: summary.averageTransaction,
            previous: summary.previousRevenue / (paymentData?.length || 1),
            change: summary.previousRevenue === 0 ? 0 :
                ((summary.averageTransaction - (summary.previousRevenue / (paymentData?.length || 1))) / 
                (summary.previousRevenue / (paymentData?.length || 1))) * 100
        }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
            </div>
        );
    }

    const transactionSummary = [
        {
            type: 'Khám bệnh',
            count: paymentData.filter(p => p.type === 'APPOINTMENT').length,
            total: paymentData.filter(p => p.type === 'APPOINTMENT')
                .reduce((sum, p) => sum + (p.amount || 0), 0),
            percentage: summary.currentRevenue === 0 ? 0 :
                (paymentData.filter(p => p.type === 'APPOINTMENT')
                    .reduce((sum, p) => sum + (p.amount || 0), 0) / summary.currentRevenue) * 100
        },
        {
            type: 'Xét nghiệm',
            count: paymentData.filter(p => p.type === 'TEST').length,
            total: paymentData.filter(p => p.type === 'TEST')
                .reduce((sum, p) => sum + (p.amount || 0), 0),
            percentage: summary.currentRevenue === 0 ? 0 :
                (paymentData.filter(p => p.type === 'TEST')
                    .reduce((sum, p) => sum + (p.amount || 0), 0) / summary.currentRevenue) * 100
        },
        {
            type: 'Thuốc',
            count: paymentData.filter(p => p.type === 'MEDICINE').length,
            total: paymentData.filter(p => p.type === 'MEDICINE')
                .reduce((sum, p) => sum + (p.amount || 0), 0),
            percentage: summary.currentRevenue === 0 ? 0 :
                (paymentData.filter(p => p.type === 'MEDICINE')
                    .reduce((sum, p) => sum + (p.amount || 0), 0) / summary.currentRevenue) * 100
        }
    ];

    return (
        <div className="financial-report">
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
                                    disabled={!paymentData.length}
                                >
                                    Xuất Excel
                                </Button>
                                <Button 
                                    icon={<PrinterOutlined />}
                                    onClick={handlePrint}
                                    disabled={!paymentData.length}
                                >
                                    In báo cáo
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Space>
            </Card>

            {paymentData.length === 0 ? (
                <Card>
                    <Empty
                        description="Không có dữ liệu cho khoảng thời gian này"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </Card>
            ) : (
                <>
                    <Card title="So sánh với kỳ trước" className="comparison-table">
                        <Table
                            columns={columns}
                            dataSource={reportData}
                            pagination={false}
                        />
                    </Card>

                    <Card title="Phân tích xu hướng doanh thu" className="trend-chart">
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={paymentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="createdAt" 
                                    tickFormatter={(date) => dayjs(date).format('DD/MM')}
                                />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value) => `${value.toLocaleString('vi-VN')} VNĐ`}
                                    labelFormatter={(label) => dayjs(label).format('DD/MM/YYYY')}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    name="Doanh thu" 
                                    stroke="#1890ff"
                                />
                                {comparisonEnabled && (
                                    <Line 
                                        type="monotone" 
                                        dataKey="previousAmount" 
                                        name="Kỳ trước" 
                                        stroke="#52c41a" 
                                        strokeDasharray="5 5"
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Chi tiết giao dịch theo loại" className="transaction-summary">
                        <Table
                            columns={[
                                {
                                    title: 'Loại giao dịch',
                                    dataIndex: 'type',
                                    key: 'type',
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'count',
                                    key: 'count',
                                },
                                {
                                    title: 'Tổng giá trị',
                                    dataIndex: 'total',
                                    key: 'total',
                                    render: (value) => `${value.toLocaleString('vi-VN')} VNĐ`
                                },
                                {
                                    title: '% Tổng doanh thu',
                                    dataIndex: 'percentage',
                                    key: 'percentage',
                                    render: (value) => `${value.toFixed(2)}%`
                                }
                            ]}
                            dataSource={transactionSummary}
                            pagination={false}
                        />
                    </Card>
                </>
            )}
        </div>
    );
};

export default FinancialReport; 