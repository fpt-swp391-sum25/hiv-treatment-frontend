import { useState, useEffect } from 'react';
import { Table, Space, Button, Row, Col, Card, Statistic, Input, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import UpdateCashierModal from './UpdateCashierModal';
import { fetchAllCashiersAPI } from '../../../services/user.service'; 
import '../../../styles/manager/DoctorManagement.css';

const CashierManagement = () => {
    const [selectedCashier, setSelectedCashier] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [cashiers, setCashiers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const loadCashiers = async () => {
        setLoading(true);
        setApiError(null);
        try {
            const response = await fetchAllCashiersAPI();
            let processedData = [];
            if (Array.isArray(response)) {
                processedData = response;
            } else if (response?.data?.content) {
                processedData = response.data.content;
            } else if (response?.data) {
                processedData = response.data;
            }

            const mapped = processedData.map(c => ({
                id: c.id,
                fullName: c.fullName || '',
                email: c.email || '',
                phone: c.phoneNumber || '',
                status: c.accountStatus || 'ACTIVE',
                gender: c.gender || '',
                address: c.address || '',
                avatar: c.avatar || '',
                dateOfBirth: c.dateOfBirth || '',
                username: c.username || '',
                createdAt: c.createdAt || '',
                isVerified: c.isVerified || false
            }));

            setCashiers(mapped);
        } catch (error) {
            console.error('Error fetching cashiers:', error);
            setApiError('Không thể tải dữ liệu thu ngân. Vui lòng thử lại sau.');
            setCashiers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCashiers();
    }, []);

    const handleUpdateCashier = (cashier) => {
        setSelectedCashier(cashier);
        setIsUpdateModalVisible(true);
    };

    const handleUpdateSuccess = () => {
        loadCashiers();
        setIsUpdateModalVisible(false);
    };

    const filteredCashiers = cashiers.filter(c =>
        c.fullName?.toLowerCase().includes(searchText.toLowerCase())
    );

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
                    <Button type="primary" size="small" onClick={() => handleUpdateCashier(record)}>
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
                            title="Tổng số thu ngân"
                            value={filteredCashiers.length}
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
                dataSource={filteredCashiers}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{
                    emptyText: loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu thu ngân'
                }}
                scroll={{ x: 'max-content' }}
                size="middle"
                bordered
                responsive
            />

            <UpdateCashierModal
                visible={isUpdateModalVisible}
                cashier={selectedCashier}
                onCancel={() => setIsUpdateModalVisible(false)}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
};

export default CashierManagement;
