import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spin, Statistic, Select, Input, Space, Button, Tooltip, Switch, Radio } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined, FilterOutlined, SearchOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts';
import { getStaffData } from '../../../../services/report.service';
import { STAFF_ROLES } from '../../../../types/report.types';
import './StaffReport.css';

const { Option } = Select;
const { Search } = Input;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const PERFORMANCE_COLORS = {
    high: '#52c41a',  // green
    medium: '#faad14', // yellow
    low: '#f5222d'    // red
};

const StaffReport = ({ dateRange, onError }) => {
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState({
        doctors: [],
        labTechnicians: [],
        managers: []
    });
    
    // State cho bộ lọc
    const [filters, setFilters] = useState({
        role: 'ALL',
        status: 'ALL',
        searchText: '',
        performanceRange: 'ALL'
    });
    const [showFilters, setShowFilters] = useState(false);
    
    // State cho biểu đồ
    const [chartType, setChartType] = useState('performance');
    const [showTopPerformers, setShowTopPerformers] = useState(true);

    useEffect(() => {
        fetchStaffData();
    }, [dateRange]);

    const fetchStaffData = async () => {
            try {
            setLoading(true);
                const data = await getStaffData();
            setStaffData({
                doctors: Array.isArray(data.doctors) ? data.doctors : [],
                labTechnicians: Array.isArray(data.labTechnicians) ? data.labTechnicians : [],
                managers: Array.isArray(data.managers) ? data.managers : []
            });
            } catch (error) {
                console.error('Error fetching staff data:', error);
            onError(error);
            } finally {
                setLoading(false);
            }
        };

    // Tính toán thống kê
    const statistics = {
        totalDoctors: staffData.doctors.length,
        totalLabTechs: staffData.labTechnicians.length,
        totalManagers: staffData.managers.length,
        totalStaff: staffData.doctors.length + staffData.labTechnicians.length + staffData.managers.length
    };

    // Dữ liệu cho biểu đồ phân bố nhân sự
    const distributionData = [
        { name: 'Bác sĩ', value: statistics.totalDoctors },
        { name: 'Kỹ thuật viên', value: statistics.totalLabTechs },
        { name: 'Quản lý', value: statistics.totalManagers }
    ];
    
    // Dữ liệu cho biểu đồ hiệu suất
    const getPerformanceData = () => {
        // Kết hợp dữ liệu bác sĩ và kỹ thuật viên
        const staffWithPerformance = [
            ...staffData.doctors,
            ...staffData.labTechnicians
        ].filter(staff => staff.performance !== undefined);
        
        // Sắp xếp theo hiệu suất giảm dần
        const sortedStaff = [...staffWithPerformance].sort((a, b) => b.performance - a.performance);
        
        // Lấy top performers hoặc tất cả
        const displayData = showTopPerformers ? sortedStaff.slice(0, 10) : sortedStaff;
        
        return displayData.map(staff => ({
            name: staff.fullName || 'Không có tên',
            performance: staff.performance || 0,
            role: staff.role === STAFF_ROLES.DOCTOR ? 'Bác sĩ' : 'Kỹ thuật viên',
            color: getPerformanceColor(staff.performance)
        }));
    };
    
    // Hàm lấy màu dựa trên hiệu suất
    const getPerformanceColor = (performance) => {
        if (performance >= 80) return PERFORMANCE_COLORS.high;
        if (performance >= 50) return PERFORMANCE_COLORS.medium;
        return PERFORMANCE_COLORS.low;
    };
    
    // Dữ liệu cho biểu đồ số ca xử lý
    const getCasesHandledData = () => {
        // Kết hợp dữ liệu bác sĩ và kỹ thuật viên
        const staffWithCases = [
            ...staffData.doctors,
            ...staffData.labTechnicians
        ].filter(staff => staff.casesHandled !== undefined);
        
        // Sắp xếp theo số ca xử lý giảm dần
        const sortedStaff = [...staffWithCases].sort((a, b) => b.casesHandled - a.casesHandled);
        
        // Lấy top performers hoặc tất cả
        const displayData = showTopPerformers ? sortedStaff.slice(0, 10) : sortedStaff;
        
        return displayData.map(staff => ({
            name: staff.fullName || 'Không có tên',
            cases: staff.casesHandled || 0,
            role: staff.role === STAFF_ROLES.DOCTOR ? 'Bác sĩ' : 'Kỹ thuật viên'
        }));
    };

    // Cấu hình cột cho bảng nhân viên
    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            width: '20%',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: '10%',
            render: (role) => {
                switch (role) {
                    case STAFF_ROLES.DOCTOR:
                        return 'Bác sĩ';
                    case STAFF_ROLES.LAB_TECHNICIAN:
                        return 'Kỹ thuật viên';
                    case STAFF_ROLES.MANAGER:
                        return 'Quản lý';
                    default:
                        return role;
                }
            }
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '20%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: '15%',
        },
        {
            title: 'Số ca đã xử lý',
            dataIndex: 'casesHandled',
            key: 'casesHandled',
            width: '15%',
            render: (cases, record) => {
                if (record.role === STAFF_ROLES.DOCTOR) {
                    return `${cases || 0} ca khám`;
                } else if (record.role === STAFF_ROLES.LAB_TECHNICIAN) {
                    return `${cases || 0} xét nghiệm`;
                }
                return '-';
            }
        },
        {
            title: 'Hiệu suất',
            dataIndex: 'performance',
            key: 'performance',
            width: '10%',
            render: (performance) => {
                let color = '#52c41a'; // green
                if (performance < 50) {
                    color = '#f5222d'; // red
                } else if (performance < 80) {
                    color = '#faad14'; // yellow
                }
                return performance ? (
                    <span style={{ color }}>
                        {performance}%
                    </span>
                ) : '-';
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
        }
    ];

    // Tạo danh sách nhân viên cho bảng
    const staffList = [
        ...staffData.doctors.map(doc => ({ ...doc, role: STAFF_ROLES.DOCTOR })),
        ...staffData.labTechnicians.map(tech => ({ ...tech, role: STAFF_ROLES.LAB_TECHNICIAN })),
        ...staffData.managers.map(mgr => ({ ...mgr, role: STAFF_ROLES.MANAGER }))
    ];
    
    // Lọc danh sách nhân viên theo bộ lọc
    const filteredStaffList = staffList.filter(staff => {
        // Lọc theo vai trò
        if (filters.role !== 'ALL' && staff.role !== filters.role) {
            return false;
        }
        
        // Lọc theo trạng thái
        if (filters.status !== 'ALL' && staff.status !== filters.status) {
            return false;
        }
        
        // Lọc theo hiệu suất
        if (filters.performanceRange !== 'ALL') {
            const performance = staff.performance || 0;
            switch (filters.performanceRange) {
                case 'LOW':
                    if (performance >= 50) return false;
                    break;
                case 'MEDIUM':
                    if (performance < 50 || performance >= 80) return false;
                    break;
                case 'HIGH':
                    if (performance < 80) return false;
                    break;
            }
        }
        
        // Lọc theo từ khóa tìm kiếm
        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            return (
                (staff.fullName && staff.fullName.toLowerCase().includes(searchLower)) ||
                (staff.email && staff.email.toLowerCase().includes(searchLower)) ||
                (staff.phoneNumber && staff.phoneNumber.toLowerCase().includes(searchLower))
            );
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
            role: 'ALL',
            status: 'ALL',
            searchText: '',
            performanceRange: 'ALL'
        });
    };
    
    // Component biểu đồ hiệu suất nhân viên
    const StaffPerformanceChart = () => {
        const performanceData = getPerformanceData();
        
        if (performanceData.length === 0) {
            return <div className="empty-chart">Không có dữ liệu hiệu suất</div>;
        }
        
        return (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={performanceData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip
                        formatter={(value, name) => [`${value}%`, 'Hiệu suất']}
                        labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                                return `${label} (${payload[0].payload.role})`;
                            }
                            return label;
                        }}
                    />
                    <Legend />
                    <Bar 
                        dataKey="performance" 
                        name="Hiệu suất"
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                    >
                        {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList dataKey="performance" position="right" formatter={(value) => `${value}%`} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };
    
    // Component biểu đồ số ca xử lý
    const CasesHandledChart = () => {
        const casesData = getCasesHandledData();
        
        if (casesData.length === 0) {
            return <div className="empty-chart">Không có dữ liệu số ca xử lý</div>;
        }
        
        return (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={casesData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip 
                        formatter={(value) => [value, 'Số lượng']}
                    />
                    <Legend />
                    <Bar 
                        dataKey="cases" 
                        name="Số ca xử lý"
                        fill="#82ca9d"
                        radius={[0, 4, 4, 0]}
                    >
                        <LabelList dataKey="cases" position="right" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <Spin spinning={loading}>
        <div className="staff-report">
            {/* Thống kê tổng quan */}
            <Row gutter={[16, 16]} className="statistics-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Tổng nhân viên"
                                value={statistics.totalStaff}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                                title="Bác sĩ"
                                value={statistics.totalDoctors}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                    <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                                title="Kỹ thuật viên"
                                value={statistics.totalLabTechs}
                                prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                    <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                                title="Quản lý"
                                value={statistics.totalManagers}
                                prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ phân bố nhân sự */}
                <Card title="Phân bố nhân sự" className="chart-card">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={distributionData}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={100}
                                tick={{ fontSize: 12 }}
                            />
                            <RechartsTooltip 
                                formatter={(value) => [value, 'Số lượng']}
                            />
                        <Legend />
                            <Bar 
                                dataKey="value" 
                                name="Số lượng"
                                fill="#8884d8"
                                radius={[0, 4, 4, 0]}
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                <LabelList dataKey="value" position="right" />
                            </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>

                {/* Biểu đồ hiệu suất nhân viên */}
                <Card 
                    title="So sánh hiệu suất nhân viên" 
                    className="chart-card"
                    extra={
                        <Space>
                            <Radio.Group 
                                value={chartType} 
                                onChange={e => setChartType(e.target.value)}
                                buttonStyle="solid"
                            >
                                <Radio.Button value="performance">
                                    <Tooltip title="Hiệu suất">
                                        <BarChartOutlined /> Hiệu suất
                                    </Tooltip>
                                </Radio.Button>
                                <Radio.Button value="cases">
                                    <Tooltip title="Số ca xử lý">
                                        <BarChartOutlined /> Số ca xử lý
                                    </Tooltip>
                                </Radio.Button>
                            </Radio.Group>
                            <span style={{ marginLeft: 8 }}>
                                Chỉ hiển thị top 10:
                                <Switch 
                                    checked={showTopPerformers}
                                    onChange={setShowTopPerformers}
                                    style={{ marginLeft: 8 }}
                                />
                            </span>
                        </Space>
                    }
                >
                    {chartType === 'performance' ? <StaffPerformanceChart /> : <CasesHandledChart />}
                </Card>

                {/* Bảng danh sách nhân viên với bộ lọc */}
                <Card 
                    title="Danh sách nhân viên" 
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
                                placeholder="Tìm kiếm nhân viên"
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
                                    value={filters.role}
                                    onChange={value => handleFilterChange('role', value)}
                                    style={{ width: 150 }}
                                >
                                    <Option value="ALL">Tất cả vai trò</Option>
                                    <Option value={STAFF_ROLES.DOCTOR}>Bác sĩ</Option>
                                    <Option value={STAFF_ROLES.LAB_TECHNICIAN}>Kỹ thuật viên</Option>
                                    <Option value={STAFF_ROLES.MANAGER}>Quản lý</Option>
                                </Select>
                                
                                <Select
                                    value={filters.status}
                                    onChange={value => handleFilterChange('status', value)}
                                    style={{ width: 150 }}
                                >
                                    <Option value="ALL">Tất cả trạng thái</Option>
                                    <Option value="ACTIVE">Đang hoạt động</Option>
                                    <Option value="INACTIVE">Không hoạt động</Option>
                                </Select>
                                
                                <Select
                                    value={filters.performanceRange}
                                    onChange={value => handleFilterChange('performanceRange', value)}
                                    style={{ width: 150 }}
                                >
                                    <Option value="ALL">Tất cả hiệu suất</Option>
                                    <Option value="LOW">Thấp (&lt;50%)</Option>
                                    <Option value="MEDIUM">Trung bình (50-79%)</Option>
                                    <Option value="HIGH">Cao (≥80%)</Option>
                                </Select>
                                
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
                        dataSource={filteredStaffList}
                    rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} nhân viên`
                        }}
                />
            </Card>
        </div>
        </Spin>
    );
};

export default StaffReport; 