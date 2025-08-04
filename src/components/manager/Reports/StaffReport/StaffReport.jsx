import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spin, Statistic, Select, Input, Space, Button, Typography, Divider, DatePicker, Tag, Alert } from 'antd';
import { UserOutlined, TeamOutlined, FilterOutlined, SearchOutlined, ReloadOutlined, FileExcelOutlined, DownloadOutlined, MedicineBoxOutlined, ExperimentOutlined, SettingOutlined } from '@ant-design/icons';
import { getStaffData, exportToExcel } from '../../../../services/report.service';
import { STAFF_ROLES } from '../../../../types/report.types';
import ReportFilters from '../ReportFilters';
import dayjs from 'dayjs';
import '../../../../styles/manager/StaffReport.css';

const { Option } = Select;
const { Search } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StaffReport = ({ dateRange, onError, onDateRangeChange }) => {
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState({
        doctors: [],
        labTechnicians: [],
        managers: []
    });
    
    // State cho bộ lọc
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'doctors', 'labTechnicians', 'managers'

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

    // Xử lý thay đổi khoảng thời gian
    const handleDateRangeChange = (dates) => {
        // Gọi hàm callback để cập nhật dateRange ở component cha
        if (typeof onDateRangeChange === 'function') {
            onDateRangeChange(dates);
        }
    };

    // Cấu hình cột cho bảng nhân viên
    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: '5%',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            width: '25%',
            render: (text, record) => (
                <Space>
                    {getRoleIcon(record.role)}
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: '15%',
            render: (role) => {
                switch (role) {
                    case STAFF_ROLES.DOCTOR:
                        return <Tag color="blue">Bác sĩ</Tag>;
                    case STAFF_ROLES.LAB_TECHNICIAN:
                        return <Tag color="green">Kỹ thuật viên</Tag>;
                    case STAFF_ROLES.MANAGER:
                        return <Tag color="purple">Quản lý</Tag>;
                    default:
                        return role;
                }
            }
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '25%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            width: '15%',
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'created_at',
            key: 'created_at',
            width: '15%',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
        }
    ];

    // Hàm lấy icon cho từng vai trò
    const getRoleIcon = (role) => {
        switch (role) {
            case STAFF_ROLES.DOCTOR:
                return <MedicineBoxOutlined style={{ color: '#1890ff' }} />;
            case STAFF_ROLES.LAB_TECHNICIAN:
                return <ExperimentOutlined style={{ color: '#52c41a' }} />;
            case STAFF_ROLES.MANAGER:
                return <SettingOutlined style={{ color: '#722ed1' }} />;
            default:
                return <UserOutlined />;
        }
    };

    // Tạo danh sách nhân viên cho bảng dựa trên tab đang chọn và dateRange
    const getStaffList = () => {
        let allStaff = [];
        
        // Lấy dữ liệu theo tab
        switch (activeTab) {
            case 'doctors':
                allStaff = staffData.doctors.map(doc => ({ ...doc, role: STAFF_ROLES.DOCTOR }));
                break;
            case 'labTechnicians':
                allStaff = staffData.labTechnicians.map(tech => ({ ...tech, role: STAFF_ROLES.LAB_TECHNICIAN }));
                break;
            case 'managers':
                allStaff = staffData.managers.map(mgr => ({ ...mgr, role: STAFF_ROLES.MANAGER }));
                break;
            default:
                allStaff = [
                    ...staffData.doctors.map(doc => ({ ...doc, role: STAFF_ROLES.DOCTOR })),
                    ...staffData.labTechnicians.map(tech => ({ ...tech, role: STAFF_ROLES.LAB_TECHNICIAN })),
                    ...staffData.managers.map(mgr => ({ ...mgr, role: STAFF_ROLES.MANAGER }))
                ];
        }
        
        // Lọc theo dateRange (cột "Ngày tham gia" - created_at)
        // CHỈ lọc khi có dateRange được chọn
        if (dateRange && dateRange.length === 2) {
            const [startDate, endDate] = dateRange;
            
            allStaff = allStaff.filter(staff => {
                // Nếu không có ngày tham gia, bỏ qua khi lọc theo thời gian
                if (!staff.created_at) return false;
                
                const staffJoinDate = dayjs(staff.created_at);
                const start = dayjs(startDate).startOf('day');
                const end = dayjs(endDate).endOf('day');
                
                return staffJoinDate.isBetween(start, end, null, '[]'); // [] means inclusive
            });
        }
        // Nếu KHÔNG có dateRange, hiển thị TẤT CẢ nhân viên (bao gồm cả những người không có created_at)
        
        return allStaff;
    };
    
    // Danh sách nhân viên hiển thị (đã lọc hoặc tất cả)
    const staffList = getStaffList();
    
    // Thống kê dựa trên dữ liệu hiển thị
    const statistics = {
        totalDoctors: staffList.filter(staff => staff.role === STAFF_ROLES.DOCTOR).length,
        totalLabTechs: staffList.filter(staff => staff.role === STAFF_ROLES.LAB_TECHNICIAN).length,
        totalManagers: staffList.filter(staff => staff.role === STAFF_ROLES.MANAGER).length,
        totalStaff: staffList.length,
        // Thêm thông tin về việc lọc
        isFiltered: dateRange && dateRange.length === 2,
        originalTotal: staffData.doctors.length + staffData.labTechnicians.length + staffData.managers.length
    };

    // Xuất Excel
    const handleExportExcel = () => {
        const staffList = getStaffList();
        
        if (staffList.length === 0) {
            onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
            return;
        }
        
        const formattedData = staffList.map(staff => ({
            'STT': '',  // Sẽ được điền sau
            'Họ tên': staff.fullName || '',
            'Vai trò': staff.role === STAFF_ROLES.DOCTOR ? 'Bác sĩ' : 
                       staff.role === STAFF_ROLES.LAB_TECHNICIAN ? 'Kỹ thuật viên' : 'Quản lý',
            'Email': staff.email || '',
            'Số điện thoại': staff.phoneNumber || '',
            'Ngày tham gia': staff.created_at ? dayjs(staff.created_at).format('DD/MM/YYYY') : 'N/A'
        }));
        
        // Thêm STT
        formattedData.forEach((item, index) => {
            item['STT'] = index + 1;
        });
        
        const reportTitle = activeTab === 'doctors' ? 'BaoCaoNhanSu_BacSi' : 
                           activeTab === 'labTechnicians' ? 'BaoCaoNhanSu_KyThuatVien' : 
                           activeTab === 'managers' ? 'BaoCaoNhanSu_QuanLy' : 'BaoCaoNhanSu_TatCa';
                           
        exportToExcel(formattedData, reportTitle);
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
                                type="primary"
                            >
                                Xuất Excel
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Bộ lọc thời gian từ FinancialReport */}
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
                    showShowAllButton={true}
                />

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="statistics-row">
                    <Col xs={24} sm={12} md={6}>
                        <Card className="statistic-card">
                            <Statistic
                                title="Tổng số nhân viên"
                                value={statistics.totalStaff}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="statistic-card" onClick={() => setActiveTab('doctors')}>
                            <Statistic
                                title="Bác sĩ"
                                value={statistics.totalDoctors}
                                prefix={<MedicineBoxOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="statistic-card" onClick={() => setActiveTab('labTechnicians')}>
                            <Statistic
                                title="Kỹ thuật viên"
                                value={statistics.totalLabTechs}
                                prefix={<ExperimentOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="statistic-card" onClick={() => setActiveTab('managers')}>
                            <Statistic
                                title="Quản lý"
                                value={statistics.totalManagers}
                                prefix={<SettingOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Tab lọc theo vai trò */}
                <div className="staff-tabs">
                    <Button 
                        type={activeTab === 'all' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả nhân viên
                    </Button>
                    <Button 
                        type={activeTab === 'doctors' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('doctors')}
                    >
                        Bác sĩ
                    </Button>
                    <Button 
                        type={activeTab === 'labTechnicians' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('labTechnicians')}
                    >
                        Kỹ thuật viên
                    </Button>
                    <Button 
                        type={activeTab === 'managers' ? 'primary' : 'default'}
                        onClick={() => setActiveTab('managers')}
                    >
                        Quản lý
                    </Button>
                </div>

                {/* Bảng danh sách nhân viên */}
                <Card
                    title={
                        <Space>
                            <span>Danh sách {
                                activeTab === 'doctors' ? 'bác sĩ' : 
                                activeTab === 'labTechnicians' ? 'kỹ thuật viên' : 
                                activeTab === 'managers' ? 'quản lý' : 'nhân viên'
                            }</span>
                            <Tag color="blue">{staffList.length} nhân viên</Tag>
                        </Space>
                    }
                    className="table-card"
                >
                    {staffList.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={staffList}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} nhân viên`
                        }}
                        bordered
                        size="middle"
                    />
                ) : (
                    <Alert
                        message="Không có dữ liệu"
                        description={
                            dateRange && dateRange.length === 2 
                                ? `Không tìm thấy nhân viên nào tham gia trong khoảng thời gian ${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}. Hãy thử mở rộng khoảng thời gian hoặc bỏ bộ lọc để xem tất cả nhân viên.`
                                : staffData.doctors.length + staffData.labTechnicians.length + staffData.managers.length === 0
                                    ? "Chưa có nhân viên nào trong hệ thống."
                                    : "Không tìm thấy nhân viên nào phù hợp với điều kiện lọc."
                        }
                        type="info"
                        showIcon
                    />
                )}
            </Card>
        </div>
    </Spin>
);
};

export default StaffReport;