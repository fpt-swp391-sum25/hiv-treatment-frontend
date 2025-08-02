import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, Table, Button, Select, Space, Typography, Spin, Statistic, Tag, Tooltip, Input
} from 'antd';
import {
    FileExcelOutlined, FilePdfOutlined, DollarCircleOutlined,
    CheckCircleOutlined, ClockCircleOutlined, ExceptionOutlined,
    FilterOutlined, ReloadOutlined
} from '@ant-design/icons';
import {
    getPaymentStats, calculateTotalRevenue,
    formatPaymentDataForExport, exportToExcel
} from '../../../../services/report.service';
import dayjs from 'dayjs';
import ReportFilters from '../ReportFilters';
import '../../../../styles/manager/FinancialReport.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const FinancialReport = ({ dateRange, onError, onDateRangeChange }) => {
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({
        completed: [],
        pending: [],
        failed: []
    });

    const [filters, setFilters] = useState({
        appointmentType: 'ALL',
        amountRange: 'ALL',
        status: 'ALL',
        searchText: ''
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchPaymentData();
    }, [dateRange]);

    const fetchPaymentData = async () => {
        try {
            setLoading(true);

            const [startDate, endDate] = dateRange || [];

            const start = startDate?.toISOString();
            const end = endDate?.toISOString();

            const [completedVNPay, completedCash, pending, failed] = await Promise.all([
                getPaymentStats(start, end)
            ]);

            setPaymentData({
                completed: [...(completedVNPay || []), ...(completedCash || [])],
                pending: pending || [],
                failed: failed || []
            });

        } catch (error) {
            console.error('Error fetching payment data:', error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (!paymentData.completed?.length) {
            onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
            return;
        }
        const formattedData = formatPaymentDataForExport(paymentData.completed);
        exportToExcel(formattedData, 'BaoCaoTaiChinh');
    };

    const handleExportPDF = async () => {
        try {
            if (!paymentData.completed?.length) {
                onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
                return;
            }

            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF();
            const title = 'BÁO CÁO TÀI CHÍNH';
            doc.setFontSize(18);
            doc.text(title, 14, 22);

            const reportDate = dayjs().format('DD/MM/YYYY HH:mm');
            const reportPeriod = dateRange?.length === 2
                ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
                : 'Tất cả thời gian';

            doc.setFontSize(12);
            doc.text(`Thời gian xuất báo cáo: ${reportDate}`, 14, 32);
            doc.text(`Khoảng thời gian báo cáo: ${reportPeriod}`, 14, 40);
            doc.text(`Tổng doanh thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(statistics.totalRevenue)}`, 14, 48);

            const formattedData = formatPaymentDataForExport(paymentData.completed);
            const headers = Object.keys(formattedData[0]);
            const data = formattedData.map(item => Object.values(item));

            autoTable(doc, {
                startY: 56,
                head: [headers],
                body: data,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            const pdfFileName = `BaoCaoTaiChinh_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
            doc.save(pdfFileName);

        } catch (error) {
            console.error('Error exporting PDF:', error);
            onError?.(new Error('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.'));
        }
    };

    const statistics = {
        totalRevenue: calculateTotalRevenue(paymentData.completed),
        totalCompleted: paymentData.completed.length,
        totalPending: paymentData.pending.length,
        totalFailed: paymentData.failed.length,
        totalTransactions: paymentData.completed.length + paymentData.pending.length + paymentData.failed.length
    };

    const allPayments = [...paymentData.completed, ...paymentData.pending, ...paymentData.failed].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    const filteredPayments = allPayments.filter(payment => {
        const { appointmentType, amountRange, status, searchText } = filters;

        if (appointmentType !== 'ALL' && (payment.schedule?.type || '') !== appointmentType) return false;

        const amount = Number(payment.amount) || 0;
        if (
            (amountRange === 'LOW' && amount >= 500000) ||
            (amountRange === 'MEDIUM' && (amount < 500000 || amount >= 2000000)) ||
            (amountRange === 'HIGH' && amount < 2000000)
        ) return false;

        if (status !== 'ALL') {
            const actualStatus = payment.status;
            if (status === 'COMPLETED' && actualStatus !== 'Thanh toán thành công' && actualStatus !== 'Đã thanh toán') return false;
            else if (status !== 'COMPLETED' && actualStatus !== status) return false;
        }

        if (searchText) {
            const search = searchText.toLowerCase();
            return (
                payment.id?.toString().toLowerCase().includes(search) ||
                payment.description?.toLowerCase().includes(search) ||
                payment.schedule?.patient?.fullName?.toLowerCase().includes(search) ||
                payment.schedule?.doctor?.fullName?.toLowerCase().includes(search)
            );
        }

        return true;
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const TransactionsTable = () => {
        const columns = [
            { title: 'Mã giao dịch', dataIndex: 'id', key: 'id', width: '10%', sorter: (a, b) => Number(a.id) - Number(b.id), defaultSortOrder: 'ascend' },
            { title: 'Thời gian', dataIndex: 'time', key: 'time', width: '15%', render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'), sorter: (a, b) => dayjs(a.time).valueOf() - dayjs(b.time).valueOf() },
            { title: 'Bệnh nhân', key: 'patient', width: '15%', render: (_, record) => record.schedule?.patient?.fullName || 'N/A' },
            { title: 'Bác sĩ', key: 'doctor', width: '15%', render: (_, record) => record.schedule?.doctor?.fullName || 'N/A' },
            { title: 'Loại lịch hẹn', key: 'appointmentType', width: '15%', render: (_, record) => record.schedule?.type || 'N/A' },
            { title: 'Số tiền', dataIndex: 'amount', key: 'amount', width: '15%', render: (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0), sorter: (a, b) => a.amount - b.amount },
            { title: 'Loại thanh toán', key: 'paymentType', width: '15%', render: (_, record) => record.description || 'Không rõ' },
            {
                title: 'Trạng thái', dataIndex: 'status', key: 'status', width: '15%',
                render: (status) => {
                    let color = status === 'Chờ thanh toán' ? 'gold' : status === 'Thanh toán thất bại' ? 'red' : 'green';
                    return <Tag color={color}>{status}</Tag>;
                },
                filters: [
                    { text: 'Hoàn thành', value: 'COMPLETED' },
                    { text: 'Đang xử lý', value: 'Chờ thanh toán' },
                    { text: 'Thất bại', value: 'Thanh toán thất bại' },
                ],
                onFilter: (value, record) => {
                    if (value === 'COMPLETED') {
                        return ['Thanh toán thành công', 'Đã thanh toán'].includes(record.status);
                    }
                    return record.status === value;
                }
            }
        ];

        return (
            <Card
                title={<Space><span>Danh sách giao dịch</span><Tag color="blue">{filteredPayments.length} giao dịch</Tag></Space>}
                className="table-card"
                extra={
                    <Space>
                        <Tooltip title="Hiển thị/Ẩn bộ lọc">
                            <Button icon={<FilterOutlined />} onClick={() => setShowFilters(!showFilters)} type={showFilters ? "primary" : "default"}>Bộ lọc</Button>
                        </Tooltip>
                        <Search placeholder="Tìm kiếm giao dịch" allowClear value={filters.searchText} onChange={e => handleFilterChange('searchText', e.target.value)} style={{ width: 200 }} />
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredPayments}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng số ${total} giao dịch`
                    }}
                    summary={pageData => {
                        const total = pageData
                            .filter(p => ['Thanh toán thành công', 'Đã thanh toán'].includes(p.status))
                            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                        return (
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={5}><strong>Tổng</strong></Table.Summary.Cell>
                                <Table.Summary.Cell index={1}><strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</strong></Table.Summary.Cell>
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
                <Row gutter={[16, 16]} className="report-header">
                    <Col span={16}>
                        <Title level={2}>Báo cáo tài chính</Title>
                        <Text type="secondary">
                            Kỳ báo cáo: {dateRange?.length === 2
                                ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
                                : 'Tất cả thời gian'}
                        </Text>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }}>
                        <Space>
                            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>Xuất Excel</Button>
                            <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>Xuất PDF</Button>
                        </Space>
                    </Col>
                </Row>

                {/* Bộ lọc thời gian mới */}
                <ReportFilters
                    onFilterChange={({ filterType, selectedDate }) => {
                        if (selectedDate) {
                            const start = dayjs(selectedDate);
                            let end = start.endOf(filterType);
                            onDateRangeChange([start, end]);
                        } else {
                            onDateRangeChange(null);
                        }
                    }}
                    initialFilters={{
                        filterType: 'month',
                        selectedDate: dateRange?.[0]?.toISOString() || null,
                    }}
                />

                {/* Thống kê */}
                <Row gutter={[16, 16]} className="statistics-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Tổng doanh thu" value={statistics.totalRevenue} precision={0} formatter={val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0)} prefix={<DollarCircleOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card><Statistic title="Giao dịch hoàn thành" value={statistics.totalCompleted} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card><Statistic title="Giao dịch đang xử lý" value={statistics.totalPending} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} /></Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card><Statistic title="Giao dịch thất bại" value={statistics.totalFailed} prefix={<ExceptionOutlined style={{ color: '#ff4d4f' }} />} /></Card>
                    </Col>
                </Row>

                {/* Bảng giao dịch */}
                <TransactionsTable />
            </div>
        </Spin>
    );
};

export default FinancialReport;
