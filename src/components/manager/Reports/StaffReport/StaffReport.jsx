import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spin, Statistic, Select, Input, Space, Button, Tooltip, Switch, Radio, Typography, Divider, DatePicker, Tag } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined, FilterOutlined, SearchOutlined, ReloadOutlined, BarChartOutlined, FileExcelOutlined, PrinterOutlined } from '@ant-design/icons';
import { ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts';
import { getStaffData, formatStaffDataForExport, exportToExcel } from '../../../../services/report.service';
import { STAFF_ROLES } from '../../../../types/report.types';
import './StaffReport.css';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
const PERFORMANCE_COLORS = {
    high: '#52c41a',  // green
    medium: '#faad14', // yellow
    low: '#f5222d'    // red
};

const StaffReport = ({ dateRange, onError, onDateRangeChange }) => {
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
    const [selectedDatePreset, setSelectedDatePreset] = useState('all');

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

    // Xuất Excel
    const handleExportExcel = () => {
        const staffList = [
            ...staffData.doctors.map(doc => ({ ...doc, role: 'Bác sĩ' })),
            ...staffData.labTechnicians.map(tech => ({ ...tech, role: 'Kỹ thuật viên' })),
            ...staffData.managers.map(mgr => ({ ...mgr, role: 'Quản lý' }))
        ];
        
        if (staffList.length === 0) {
            onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
            return;
        }
        
        const formattedData = staffList.map(staff => ({
            'Họ tên': staff.fullName || '',
            'Vai trò': staff.role || '',
            'Email': staff.email || '',
            'Số điện thoại': staff.phoneNumber || '',
            'Trạng thái': staff.status || '',
            'Số ca xử lý': staff.casesHandled || 0,
            'Hiệu suất': staff.performance ? `${staff.performance}%` : 'N/A'
        }));
        
        exportToExcel(formattedData, 'BaoCaoNhanSu');
    };
    
    // In báo cáo
    const handlePrint = () => {
        window.print();
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
                {/* Tiêu đề và công cụ báo cáo */}
                <Row gutter={[16, 16]} className="report-header">
                    <Col span={16}>
                        <Title level={2}>Báo cáo nhân sự</Title>
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
                                <Typography.Text strong>Vai trò</Typography.Text>
                                <Select
                                    value={filters.role}
                                    onChange={value => handleFilterChange('role', value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    <Option value="ALL">Tất cả vai trò</Option>
                                    <Option value={STAFF_ROLES.DOCTOR}>Bác sĩ</Option>
                                    <Option value={STAFF_ROLES.LAB_TECHNICIAN}>Kỹ thuật viên</Option>
                                    <Option value={STAFF_ROLES.MANAGER}>Quản lý</Option>
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
                                    <Option value="ACTIVE">Đang hoạt động</Option>
                                    <Option value="INACTIVE">Không hoạt động</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Typography.Text strong>Hiệu suất</Typography.Text>
                                <Select
                                    value={filters.performanceRange}
                                    onChange={value => handleFilterChange('performanceRange', value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                >
                                    <Option value="ALL">Tất cả hiệu suất</Option>
                                    <Option value="LOW">Thấp (&lt;50%)</Option>
                                    <Option value="MEDIUM">Trung bình (50-80%)</Option>
                                    <Option value="HIGH">Cao (≥80%)</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Typography.Text strong>Tìm kiếm</Typography.Text>
                                <Search
                                    placeholder="Tìm kiếm nhân viên"
                                    value={filters.searchText}
                                    onChange={e => handleFilterChange('searchText', e.target.value)}
                                    style={{ width: '100%', marginTop: 8 }}
                                    allowClear
                                />
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
                                title="Tổng số nhân viên"
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
                                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Kỹ thuật viên"
                                value={statistics.totalLabTechs}
                                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Quản lý"
                                value={statistics.totalManagers}
                                prefix={<UserOutlined style={{ color: '#722ed1' }} />}
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

                {/* Bảng danh sách nhân viên */}
                <Card 
                    title={
                        <Space>
                            <span>Danh sách nhân viên</span>
                            <Tag color="blue">{filteredStaffList.length} nhân viên</Tag>
                        </Space>
                    } 
                    className="table-card"
                >
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