import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spin, Statistic, Select, Input, Space, Button, Typography, Divider, DatePicker, Tag, Alert } from 'antd';
import { UserOutlined, TeamOutlined, FilterOutlined, SearchOutlined, ReloadOutlined, FileExcelOutlined, FilePdfOutlined, DownloadOutlined, MedicineBoxOutlined, ExperimentOutlined, SettingOutlined } from '@ant-design/icons';
import { getStaffData, exportToExcel } from '../../../../services/report.service';
import { STAFF_ROLES } from '../../../../types/report.types';
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
    const [filters, setFilters] = useState({
        role: 'ALL',
        searchText: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDatePreset, setSelectedDatePreset] = useState('all');
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

    // Tính toán thống kê
    const statistics = {
        totalDoctors: staffData.doctors.length,
        totalLabTechs: staffData.labTechnicians.length,
        totalManagers: staffData.managers.length,
        totalStaff: staffData.doctors.length + staffData.labTechnicians.length + staffData.managers.length,
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

    // Tạo danh sách nhân viên cho bảng dựa trên tab đang chọn
    const getStaffList = () => {
        switch (activeTab) {
            case 'doctors':
                return staffData.doctors.map(doc => ({ ...doc, role: STAFF_ROLES.DOCTOR }));
            case 'labTechnicians':
                return staffData.labTechnicians.map(tech => ({ ...tech, role: STAFF_ROLES.LAB_TECHNICIAN }));
            case 'managers':
                return staffData.managers.map(mgr => ({ ...mgr, role: STAFF_ROLES.MANAGER }));
            default:
                return [
        ...staffData.doctors.map(doc => ({ ...doc, role: STAFF_ROLES.DOCTOR })),
        ...staffData.labTechnicians.map(tech => ({ ...tech, role: STAFF_ROLES.LAB_TECHNICIAN })),
        ...staffData.managers.map(mgr => ({ ...mgr, role: STAFF_ROLES.MANAGER }))
    ];
        }
    };
    
    // Lọc danh sách nhân viên theo bộ lọc
    const filteredStaffList = getStaffList().filter(staff => {
        // Lọc theo vai trò
        if (filters.role !== 'ALL' && staff.role !== filters.role) {
            return false;
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
            searchText: '',
        });
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
    
    // Xuất PDF
    const handleExportPDF = async () => {
        try {
            const staffList = getStaffList();
            
            if (staffList.length === 0) {
                onError?.(new Error('Không có dữ liệu để xuất báo cáo'));
                return;
            }
            
            // Import động jsPDF và jsPDF-autotable để tránh lỗi khi khởi tạo ứng dụng
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            
            const doc = new jsPDF();
            
            // Tiêu đề báo cáo
            const title = 'BÁO CÁO NHÂN SỰ';
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
            
            // Chuẩn bị dữ liệu cho bảng
            const formattedData = staffList.map((staff, index) => ({
                'STT': index + 1,
                'Họ tên': staff.fullName || '',
                'Vai trò': staff.role === STAFF_ROLES.DOCTOR ? 'Bác sĩ' : 
                          staff.role === STAFF_ROLES.LAB_TECHNICIAN ? 'Kỹ thuật viên' : 'Quản lý',
                'Email': staff.email || '',
                'Số điện thoại': staff.phoneNumber || '',
                'Ngày tham gia': staff.created_at ? dayjs(staff.created_at).format('DD/MM/YYYY') : 'N/A'
            }));
            
            // Tạo bảng dữ liệu
            const headers = Object.keys(formattedData[0]);
            const data = formattedData.map(item => Object.values(item));
            
            autoTable(doc, {
                startY: 50,
                head: [headers],
                body: data,
                theme: 'grid',
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
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
            const reportTitle = activeTab === 'doctors' ? 'BaoCaoNhanSu_BacSi' : 
                              activeTab === 'labTechnicians' ? 'BaoCaoNhanSu_KyThuatVien' : 
                              activeTab === 'managers' ? 'BaoCaoNhanSu_QuanLy' : 'BaoCaoNhanSu_TatCa';
            const pdfFileName = `${reportTitle}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
            doc.save(pdfFileName);
            
        } catch (error) {
            console.error('Error exporting PDF:', error);
            onError?.(new Error('Không thể xuất báo cáo PDF. Vui lòng thử lại sau.'));
        }
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
                            <Tag color="blue">{filteredStaffList.length} nhân viên</Tag>
                        </Space>
                    }
                    className="table-card"
                    extra={
                        <Button 
                            type="primary" 
                            icon={<DownloadOutlined />} 
                            onClick={handleExportExcel}
                        >
                            Xuất danh sách
                        </Button>
                    }
                >
                    {filteredStaffList.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={filteredStaffList}
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
                            description="Không tìm thấy nhân viên nào phù hợp với điều kiện lọc."
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