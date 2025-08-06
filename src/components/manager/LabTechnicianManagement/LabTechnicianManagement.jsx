import { useState, useEffect } from 'react';
import { Table, Space, Button, Row, Col, Card, Statistic, Select, Input, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import UpdateLabTechnicianModal from './UpdateLabTechnicianModal';
import { fetchAllLabTechniciansAPI } from '../../../services/user.service';
import '../../../styles/manager/DoctorManagement.css';

const LabTechnicianManagement = () => {
    const [selectedLabTechnician, setSelectedLabTechnician] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [selectedLabTechnicianId] = useState('all');
    const [searchText, setSearchText] = useState('');

    const [labTechnicians, setLabTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const loadLabTechnicians = async () => {
        setLoading(true);
        setApiError(null);
        try {
            const response = await fetchAllLabTechniciansAPI();
            let processedData = [];
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

            const mappedData = processedData.map(tech => {
                return {
                    id: tech.id,
                    fullName: tech.fullName || '',
                    email: tech.email || '',
                    phone: tech.phoneNumber || '',
                    status: tech.accountStatus || 'ACTIVE',
                    gender: tech.gender || '', 
                    address: tech.address || '',
                    avatar: tech.avatar || '',
                    dateOfBirth: tech.dateOfBirth || '',
                    username: tech.username || '',
                    createdAt: tech.createdAt || '',
                    isVerified: tech.isVerified || false
                };
            });

            setLabTechnicians(mappedData);
        } catch (error) {
            console.error('Error fetching lab technicians:', error);
            setApiError('Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau.');
            setLabTechnicians([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLabTechnicians();
    }, []);

    const handleUpdateLabTechnician = (technician) => {
        setSelectedLabTechnician(technician);
        setIsUpdateModalVisible(true);
    };

    const handleUpdateSuccess = () => {
        loadLabTechnicians();
        setIsUpdateModalVisible(false);
    };

    const filteredLabTechnicians = labTechnicians ? labTechnicians.filter((tech) => {
        const matchTechnician = selectedLabTechnicianId === 'all' || (tech.id && tech.id.toString() === selectedLabTechnicianId.toString());
        const matchName = tech.fullName && tech.fullName.toLowerCase().includes(searchText.toLowerCase());
        return matchTechnician && matchName;
    }) : [];

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
            width: '18%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            width: '22%',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: '15%',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: '10%',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            width: '20%',
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: '15%',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" size="small" onClick={() => handleUpdateLabTechnician(record)}>
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
                <Col xs={24}>
                    <Card>
                        <Statistic
                            title="Tổng số kỹ thuật viên phòng thí nghiệm"
                            value={filteredLabTechnicians.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="doctor-filters">
                <Row gutter={16} align="middle">
                    <Col xs={24} md={12}>
                        <Input
                            placeholder="Tìm kiếm theo tên"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
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

            <UpdateLabTechnicianModal
                visible={isUpdateModalVisible}
                labTechnician={selectedLabTechnician}
                onCancel={() => setIsUpdateModalVisible(false)}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
};

export default LabTechnicianManagement;
