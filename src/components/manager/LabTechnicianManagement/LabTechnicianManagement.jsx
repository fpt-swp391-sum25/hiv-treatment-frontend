import React, { useState, useContext, useEffect } from 'react';
import { Table, Space, Button, message, Tag, Row, Col, Card, Statistic, Select, Input, Alert } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { fetchAllLabTechniciansAPI, updateUserAPI } from '../../../services/api.service';
import UpdateLabTechnicianModal from './UpdateLabTechnicianModal';
import LabTechnicianDetail from './LabTechnicianDetail';
import { AuthContext } from '../../context/AuthContext';
import '../DoctorManagement/DoctorManagement.css';

const LabTechnicianManagement = () => {
    const [selectedLabTechnician, setSelectedLabTechnician] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
    const [selectedLabTechnicianId, setSelectedLabTechnicianId] = useState('all');
    const [searchText, setSearchText] = useState('');
    const { user } = useContext(AuthContext);
    
    // Thay thế useApi bằng useState và useEffect
    const [labTechnicians, setLabTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    // Hàm load dữ liệu
    const loadLabTechnicians = async () => {
        setLoading(true);
        setApiError(null);
        try {
            const response = await fetchAllLabTechniciansAPI();
            console.log('Lab technicians API response:', response);
            
            let processedData = [];
            
            // Xử lý dữ liệu API trả về
            if (Array.isArray(response)) {
                processedData = response;
            } else if (response && Array.isArray(response.data)) {
                processedData = response.data;
            } else if (response && response.data && Array.isArray(response.data.content)) {
                processedData = response.data.content;
            } else {
                console.warn('Unexpected response format:', response);
                processedData = [];
            }
            
            // Map dữ liệu theo cấu trúc chính xác từ BE
            const mappedData = processedData.map(tech => ({
                id: tech.id,
                fullName: tech.fullName || '',
                email: tech.email || '',
                phone: tech.phoneNumber || '',
                status: tech.accountStatus || 'ACTIVE',
                gender: tech.gender || 'MALE',
                address: tech.address || '',
                avatarUrl: tech.avatar || '',
                dateOfBirth: tech.dateOfBirth || '',
                username: tech.username || '',
                createdAt: tech.createdAt || '',
                isVerified: tech.isVerified || false
            }));
            
            setLabTechnicians(mappedData);
        } catch (error) {
            console.error('Error fetching lab technicians:', error);
            setApiError('Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau.');
            // Fallback về mảng rỗng nếu có lỗi
            setLabTechnicians([]);
        } finally {
            setLoading(false);
        }
    };
    
    // Gọi API khi component mount
    useEffect(() => {
        loadLabTechnicians();
    }, []);

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
    const filteredLabTechnicians = labTechnicians ? labTechnicians.filter((tech) => {
        const matchTechnician = selectedLabTechnicianId === 'all' || (tech.id && tech.id.toString() === selectedLabTechnicianId.toString());
        const matchName = tech.fullName && tech.fullName.toLowerCase().includes(searchText.toLowerCase());
        return matchTechnician && matchName;
    }) : [];

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
            ellipsis: true,
            width: '15%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            width: '20%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: '12%',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: '8%',
            render: (gender) => {
                return gender === 'MALE' ? 'Nam' : gender === 'FEMALE' ? 'Nữ' : 'Khác';
            }
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            width: '20%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: '10%',
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
            fixed: 'right',
            width: '15%',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" size="small" onClick={() => handleViewProfile(record)}>
                        Xem chi tiết
                    </Button>
                    <Button size="small" onClick={() => handleUpdateLabTechnician(record)}>
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
                            value={filteredLabTechnicians.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Đang làm việc"
                            value={filteredLabTechnicians.filter(t => t && t.status === AccountStatus.ACTIVE).length}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Không hoạt động"
                            value={filteredLabTechnicians.filter(t => t && t.status !== AccountStatus.ACTIVE).length}
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
                            {labTechnicians && labTechnicians.map((tech) => (
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
                    emptyText: loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu nhân viên'
                }}
                scroll={{ x: 'max-content' }}
                size="middle"
                bordered
                responsive={true}
            />

            {/* Modal cập nhật thông tin nhân viên */}
            <UpdateLabTechnicianModal
                visible={isUpdateModalVisible}
                labTechnician={selectedLabTechnician}
                onCancel={() => setIsUpdateModalVisible(false)}
                onSuccess={handleUpdateSuccess}
            />

            {/* Modal xem chi tiết nhân viên */}
            <LabTechnicianDetail
                visible={isProfileDetailVisible}
                labTechnician={selectedLabTechnician}
                onCancel={() => setIsProfileDetailVisible(false)}
            />
        </div>
    );
};

export default LabTechnicianManagement;
