import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Statistic, Spin, Empty, Typography, Select, Tag, Space, Button } from 'antd';
import { UserOutlined, SolutionOutlined, ExperimentOutlined, CheckCircleOutlined, CloseCircleOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getStaffStatistics, formatStaffDataForExport, exportToExcel } from '../../../../services/report.service';
import { STAFF_REPORT_TYPES } from '../../../../types/report.types';
import './StaffReport.css';
import StaffPerformanceDetail from './StaffPerformanceDetail';

const { Title } = Typography;
const { Option } = Select;

// Màu sắc cho Pie Chart
const COLORS = ['#1890ff', '#52c41a', '#faad14'];

// Hằng số đánh giá hiệu suất
const PERFORMANCE_LEVELS = {
    HIGH: { min: 80, label: 'Tốt', color: '#52c41a' },
    MEDIUM: { min: 50, label: 'Khá', color: '#faad14' },
    LOW: { min: 0, label: 'Cần cải thiện', color: '#ff4d4f' }
};

// Đánh giá hiệu suất dựa trên tỷ lệ hoàn thành
const evaluatePerformance = (completionRate) => {
    if (completionRate >= PERFORMANCE_LEVELS.HIGH.min) return PERFORMANCE_LEVELS.HIGH;
    if (completionRate >= PERFORMANCE_LEVELS.MEDIUM.min) return PERFORMANCE_LEVELS.MEDIUM;
    return PERFORMANCE_LEVELS.LOW;
};

const StaffReport = ({ dateRange }) => {
    const [staffStats, setStaffStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRole, setSelectedRole] = useState('all');
    const [sortField, setSortField] = useState('performance');
    const [sortOrder, setSortOrder] = useState('descend');
    const [selectedStaff, setSelectedStaff] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const stats = await getStaffStatistics(dateRange[0], dateRange[1]);
                setStaffStats(stats);
            } catch (error) {
                console.error('Error fetching staff statistics:', error);
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (dateRange && dateRange.length === 2) {
            fetchData();
        }
    }, [dateRange]);

    const staffDistributionData = staffStats ? [
        {
            name: 'Phân bố nhân sự',
            'Bác sĩ': staffStats.staffDistribution.doctors,
            'Kỹ thuật viên': staffStats.staffDistribution.labTechnicians,
            'Quản lý': staffStats.staffDistribution.managers,
        }
    ] : [];

    const doctorPerformanceData = staffStats?.doctorStats?.map(doctor => ({
        name: doctor.fullName,
        'Tổng lịch hẹn': doctor.totalAppointments,
        'Hoàn thành': doctor.completedAppointments,
        'Hủy': doctor.cancelledAppointments,
        'Tỷ lệ hoàn thành': doctor.completionRate.toFixed(2)
    })) || [];

    // Chuẩn bị dữ liệu cho Pie Chart
    const pieChartData = staffStats ? [
        {
            name: 'Bác sĩ',
            value: staffStats.staffDistribution.doctors,
        },
        {
            name: 'Kỹ thuật viên',
            value: staffStats.staffDistribution.labTechnicians,
        },
        {
            name: 'Quản lý',
            value: staffStats.staffDistribution.managers,
        }
    ] : [];

    // Tính tổng số nhân viên
    const totalStaff = pieChartData.reduce((sum, item) => sum + item.value, 0);

    // Custom tooltip cho Pie Chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip">
                    <p>{`${data.name}: ${data.value} người`}</p>
                    <p>{`Tỷ lệ: ${((data.value / totalStaff) * 100).toFixed(1)}%`}</p>
                </div>
            );
        }
        return null;
    };

    // Cập nhật columns với thông tin hiệu suất chi tiết
    const columns = [
        {
            title: 'Tên nhân viên',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'Bác sĩ', value: 'Bác sĩ' },
                { text: 'Kỹ thuật viên', value: 'Kỹ thuật viên' }
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Công việc hoàn thành',
            key: 'completedWork',
            render: (_, record) => {
                if (record.role === 'Bác sĩ') {
                    const doctorStat = staffStats?.doctorStats?.find(d => d.id === record.id);
                    return (
                        <span>
                            {doctorStat?.completedAppointments || 0}/{doctorStat?.totalAppointments || 0} lịch hẹn
                        </span>
                    );
                }
                if (record.role === 'Kỹ thuật viên') {
                    const techStat = staffStats?.labTechStats?.find(t => t.id === record.id);
                    return (
                        <span>
                            {techStat?.completedTests || 0}/{techStat?.totalTests || 0} xét nghiệm
                        </span>
                    );
                }
                return '-';
            },
        },
        {
            title: () => (
                <Space>
                    Hiệu suất
                    <Button
                        type="text"
                        icon={sortOrder === 'ascend' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                        onClick={() => setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend')}
                        size="small"
                    />
                </Space>
            ),
            key: 'performance',
            sorter: (a, b) => {
                const getPerformance = (record) => {
                    if (record.role === 'Bác sĩ') {
                        const doctorStat = staffStats?.doctorStats?.find(d => d.id === record.id);
                        return doctorStat?.completionRate || 0;
                    }
                    if (record.role === 'Kỹ thuật viên') {
                        const techStat = staffStats?.labTechStats?.find(t => t.id === record.id);
                        return ((techStat?.completedTests || 0) / (techStat?.totalTests || 1)) * 100;
                    }
                    return 0;
                };
                return getPerformance(a) - getPerformance(b);
            },
            sortOrder: sortField === 'performance' ? sortOrder : null,
            render: (_, record) => {
                let performance = 0;
                if (record.role === 'Bác sĩ') {
                    const doctorStat = staffStats?.doctorStats?.find(d => d.id === record.id);
                    performance = doctorStat?.completionRate || 0;
                }
                if (record.role === 'Kỹ thuật viên') {
                    const techStat = staffStats?.labTechStats?.find(t => t.id === record.id);
                    performance = ((techStat?.completedTests || 0) / (techStat?.totalTests || 1)) * 100;
                }
                const evaluation = evaluatePerformance(performance);
                return (
                    <Space>
                        <Tag color={evaluation.color}>{evaluation.label}</Tag>
                        <span>{performance.toFixed(1)}%</span>
                    </Space>
                );
            },
        },
    ];

    // Cập nhật filteredStaffData với sắp xếp
    const filteredStaffData = React.useMemo(() => {
        if (!staffStats) return [];
        
        let data = [
            ...staffStats.doctorStats.map(doc => ({ ...doc, role: 'Bác sĩ' })),
            ...staffStats.labTechStats.map(tech => ({ ...tech, role: 'Kỹ thuật viên' }))
        ];

        // Lọc theo vai trò
        if (selectedRole !== 'all') {
            data = data.filter(staff => staff.role === selectedRole);
        }

        return data;
    }, [staffStats, selectedRole]);

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Đang tải dữ liệu báo cáo...">
                    <div className="loading-content" />
                </Spin>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <Empty
                    description={error}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </Card>
        );
    }

    return (
        <div className="staff-report">
            <Card className="report-header">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={4}>Báo cáo nhân sự</Title>
                    </Col>
                    <Col>
                        <Select
                            value={selectedRole}
                            onChange={setSelectedRole}
                            style={{ width: 150 }}
                        >
                            <Option value="all">Tất cả vai trò</Option>
                            <Option value="Bác sĩ">Bác sĩ</Option>
                            <Option value="Kỹ thuật viên">Kỹ thuật viên</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Thống kê tổng quan */}
            <Row gutter={[16, 16]} className="statistics-row">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số bác sĩ"
                            value={staffStats?.staffDistribution.doctors || 0}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số kỹ thuật viên"
                            value={staffStats?.staffDistribution.labTechnicians || 0}
                            prefix={<ExperimentOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số quản lý"
                            value={staffStats?.staffDistribution.managers || 0}
                            prefix={<SolutionOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Thống kê lịch hẹn */}
            <Row gutter={[16, 16]} className="statistics-row">
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số lịch hẹn"
                            value={staffStats?.scheduleStats.total || 0}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Lịch hẹn hoàn thành"
                            value={staffStats?.scheduleStats.completed || 0}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Lịch hẹn hủy"
                            value={staffStats?.scheduleStats.cancelled || 0}
                            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Thêm biểu đồ tròn phân bố nhân sự */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Phân bố nhân sự theo vai trò" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Phân bố nhân sự" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={staffDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Bác sĩ" fill="#1890ff" />
                                <Bar dataKey="Kỹ thuật viên" fill="#52c41a" />
                                <Bar dataKey="Quản lý" fill="#faad14" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ hiệu suất bác sĩ */}
            <Card title="Hiệu suất bác sĩ" className="chart-card">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={doctorPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Tổng lịch hẹn" fill="#1890ff" />
                        <Bar dataKey="Hoàn thành" fill="#52c41a" />
                        <Bar dataKey="Hủy" fill="#ff4d4f" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Cập nhật bảng với các tính năng mới */}
            <Card 
                title={
                    <Row justify="space-between" align="middle">
                        <Col>Danh sách nhân sự</Col>
                        <Col>
                            <Space>
                                <span>Sắp xếp theo: </span>
                                <Select
                                    value={sortField}
                                    onChange={(value) => setSortField(value)}
                                    style={{ width: 150 }}
                                >
                                    <Option value="performance">Hiệu suất</Option>
                                    <Option value="name">Tên</Option>
                                    <Option value="role">Vai trò</Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>
                }
                className="table-card"
            >
                <Table
                    columns={columns}
                    dataSource={filteredStaffData}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: () => setSelectedStaff(record)
                    })}
                    onChange={(pagination, filters, sorter) => {
                        if (sorter.field) {
                            setSortField(sorter.field);
                            setSortOrder(sorter.order);
                        }
                    }}
                />
            </Card>

            {/* Thêm chi tiết hiệu suất nhân viên */}
            {selectedStaff && (
                <StaffPerformanceDetail
                    staffId={selectedStaff.id}
                    role={selectedStaff.role === 'Bác sĩ' ? 'DOCTOR' : 'LAB_TECHNICIAN'}
                    staffName={selectedStaff.fullName}
                    dateRange={dateRange}
                />
            )}
        </div>
    );
};

export default StaffReport; 