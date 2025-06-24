import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Tag, Row, Col, Card, Statistic, Spin, Select, Input, Alert } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { fetchUsersByRoleAPI, updateAccountAPI } from '../../../services/api.service';
import '../DoctorManagement/DoctorManagement.css';

const LabTechnicianManagement = () => {
    const [labTechnicians, setLabTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLabTechnician, setSelectedLabTechnician] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
    const [selectedLabTechnicianId, setSelectedLabTechnicianId] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        loadLabTechnicians();
    }, []);

    const loadLabTechnicians = async () => {
        setLoading(true);
        setApiError(null);
        try {
            console.log('Fetching lab technicians from API...');
            // Gọi API lấy danh sách nhân viên với role=2
            const response = await fetchUsersByRoleAPI(2);
            console.log('API response:', response);
            
            // Kiểm tra cấu trúc response để xác định nơi chứa dữ liệu
            let technicianData = [];
            
            if (response && response.data) {
                technicianData = response.data;
            } else if (response && Array.isArray(response)) {
                technicianData = response;
            } else if (response) {
                technicianData = response;
            }
            
            // Đảm bảo technicianData là một mảng
            const techniciansList = Array.isArray(technicianData) ? technicianData : [];
            
            console.log('Lab technicians data after processing:', techniciansList);
            
            if (techniciansList.length > 0) {
                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                // Dựa vào cấu trúc bảng user từ database như trong ảnh
                const formattedTechnicians = techniciansList.map(tech => {
                    // Log để kiểm tra cấu trúc dữ liệu
                    console.log('Technician data structure:', tech);
                    
                    return {
                        id: tech.id,
                        fullName: tech.full_name,
                        email: tech.email,
                        phone: tech.phone_number,
                        status: tech.account_status,
                        gender: tech.gender,
                        address: tech.address,
                        avatarUrl: tech.avatar,
                        dateOfBirth: tech.date_of_birth,
                        username: tech.username
                    };
                });
                
                console.log('Formatted lab technicians:', formattedTechnicians);
                setLabTechnicians(formattedTechnicians);
            } else {
                console.log('No lab technician data received');
                setLabTechnicians([]);
                setApiError('Không có dữ liệu nhân viên từ server');
            }
        } catch (error) {
            console.error('Error fetching lab technicians:', error);
            setLabTechnicians([]);
            
            // Hiển thị thông tin lỗi chi tiết hơn
            if (error.response) {
                console.error('Error response:', error.response);
                setApiError(`Lỗi server: ${error.response.status} - ${error.response.statusText || 'Unknown error'}`);
            } else if (error.request) {
                console.error('Error request:', error.request);
                setApiError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setApiError(`Lỗi: ${error.message || 'Unknown error'}`);
            }
            
            message.error('Không thể tải danh sách nhân viên kỹ thuật');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (technician) => {
        setSelectedLabTechnician(technician);
        setIsProfileDetailVisible(true);
    };

    const handleUpdateLabTechnician = (technician) => {
        setSelectedLabTechnician(technician);
        setIsUpdateModalVisible(true);
    };

    const handleUpdateSuccess = () => {
        message.success('Cập nhật thông tin thành công');
        loadLabTechnicians();
        setIsUpdateModalVisible(false);
    };

    // Lọc danh sách nhân viên theo dropdown và search
    const filteredLabTechnicians = labTechnicians.filter((tech) => {
        const matchTechnician = selectedLabTechnicianId === 'all' || tech.id.toString() === selectedLabTechnicianId.toString();
        const matchName = tech.fullName && tech.fullName.toLowerCase().includes(searchText.toLowerCase());
        return matchTechnician && matchName;
    });

    // Định nghĩa trạng thái tài khoản
    const AccountStatus = {
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
        SUSPENDED: 'SUSPENDED'
    };

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
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
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender) => {
                return gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : 'Khác';
            }
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                let text = 'Đang hoạt động';
                if (status === AccountStatus.INACTIVE) {
                    color = 'red';
                    text = 'Không hoạt động';
                } else if (status === AccountStatus.SUSPENDED) {
                    color = 'orange';
                    text = 'Tạm khóa';
                }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleViewProfile(record)}>
                        Xem chi tiết
                    </Button>
                    <Button onClick={() => handleUpdateLabTechnician(record)}>
                        Cập nhật
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="doctor-management">
            {apiError && (
                <Alert
                    message="Lỗi kết nối"
                    description={apiError}
                    type="error"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                />
            )}
            
            <Row gutter={[16, 16]} className="dashboard-stats">
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng số nhân viên"
                            value={labTechnicians.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Đang làm việc"
                            value={labTechnicians.filter(t => t.status === AccountStatus.ACTIVE).length}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Không hoạt động"
                            value={labTechnicians.filter(t => t.status !== AccountStatus.ACTIVE).length}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="doctor-filters">
                <Row gutter={16} align="middle">
                    <Col xs={24} md={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Chọn nhân viên"
                            onChange={(value) => setSelectedLabTechnicianId(value)}
                            value={selectedLabTechnicianId}
                        >
                            <Select.Option value="all">Tất cả nhân viên</Select.Option>
                            {labTechnicians.map((tech) => (
                                <Select.Option key={tech.id} value={tech.id}>
                                    {tech.fullName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Tìm kiếm theo tên"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={8}>
                        <Button type="primary" onClick={loadLabTechnicians} loading={loading}>
                            Làm mới dữ liệu
                        </Button>
                    </Col>
                </Row>
            </div>

            <Table
                columns={columns}
                dataSource={filteredLabTechnicians}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{
                    emptyText: apiError ? 'Lỗi tải dữ liệu' : 'Không có dữ liệu nhân viên'
                }}
            />

            {/* Phần modal cập nhật và xem chi tiết sẽ được thêm sau */}
        </div>
    );
};

export default LabTechnicianManagement;
