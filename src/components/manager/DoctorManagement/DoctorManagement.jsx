import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Tag, Row, Col, Card, Statistic, Select, Input, Alert } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { fetchAllDoctorsAPI, fetchDoctorByIdAPI, updateDoctorProfileAPI } from '../../../services/api.service';
import UpdateDoctorModal from './UpdateDoctorModal';
import DoctorProfileDetail from './DoctorProfileDetail';
import './DoctorManagement.css';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);

    // Hàm load dữ liệu bác sĩ
    const loadDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllDoctorsAPI();
            console.log('Doctors API response:', response);
            
            // Kiểm tra dữ liệu trả về
            if (Array.isArray(response)) {
                // Trường hợp API trả về trực tiếp mảng bác sĩ
                setDoctors(response);
            } else if (response && Array.isArray(response.data)) {
                // Trường hợp API trả về object có thuộc tính data là mảng
                setDoctors(response.data);
            } else {
                console.warn('Unexpected response format:', response);
                setDoctors([]);
                setError('Định dạng dữ liệu không đúng. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setError('Không thể tải dữ liệu bác sĩ. Vui lòng thử lại sau.');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        loadDoctors();
    }, []);

    const handleViewProfile = async (doctor) => {
        try {
            // Lấy thông tin chi tiết của bác sĩ từ bảng doctor_profile
            console.log('Lấy thông tin chi tiết của bác sĩ có ID:', doctor.id);
            setDetailLoading(true);
            const detailRes = await fetchDoctorByIdAPI(doctor.id);
            console.log('Thông tin chi tiết bác sĩ:', detailRes);
            
            // Kết hợp thông tin từ cả hai nguồn
            if (detailRes && detailRes.data) {
                // Trường hợp API trả về thông tin đầy đủ
                setSelectedDoctor({
                    ...doctor,  // Thông tin cơ bản từ danh sách bác sĩ
                    ...detailRes.data  // Thông tin chi tiết từ doctor_profile
                });
            } else {
                // Nếu không lấy được thông tin chi tiết, sử dụng thông tin cơ bản
                setSelectedDoctor(doctor);
                message.warning('Không tìm thấy thông tin chi tiết của bác sĩ');
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin chi tiết bác sĩ:', error);
            message.error('Không thể tải thông tin chi tiết của bác sĩ');
            // Sử dụng thông tin cơ bản nếu không lấy được chi tiết
            setSelectedDoctor(doctor);
        } finally {
            setDetailLoading(false);
            setIsProfileDetailVisible(true);
        }
    };

    const handleUpdateDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setIsUpdateModalVisible(true);
    };

    const handleUpdateSuccess = () => {
        message.success('Cập nhật thông tin thành công');
        loadDoctors();
        setIsUpdateModalVisible(false);
    };

    // Lọc danh sách bác sĩ theo dropdown và search
    const filteredDoctors = doctors.filter((doctor) => {
        const matchDoctor = selectedDoctorId === 'all' || (doctor.id && doctor.id.toString() === selectedDoctorId.toString());
        const matchName = doctor.fullName && doctor.fullName.toLowerCase().includes(searchText.toLowerCase());
        return matchDoctor && matchName;
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
            dataIndex: 'phoneNumber', // Đúng tên trường từ BE
            key: 'phoneNumber',
            width: '15%',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            width: '10%',
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
            title: 'Thao tác',
            key: 'action',
            fixed: 'right',
            width: '15%',
            render: (_, record) => (
                <Space size="small">
                    <Button type="primary" size="small" onClick={() => handleViewProfile(record)}>
                        Xem chi tiết
                    </Button>
                    <Button size="small" onClick={() => handleUpdateDoctor(record)}>
                        Cập nhật
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="doctor-management">
            {error && (
                <Alert
                    message="Lỗi kết nối"
                    description={error}
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
                            title="Tổng số bác sĩ"
                            value={filteredDoctors.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Đang làm việc"
                            value={filteredDoctors.filter(d => d && d.accountStatus === AccountStatus.ACTIVE).length}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Không hoạt động"
                            value={filteredDoctors.filter(d => d && d.accountStatus !== AccountStatus.ACTIVE).length}
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
                            placeholder="Chọn bác sĩ"
                            onChange={(value) => setSelectedDoctorId(value)}
                            value={selectedDoctorId}
                        >
                            <Select.Option value="all">Tất cả bác sĩ</Select.Option>
                            {doctors.map((doctor) => (
                                <Select.Option key={doctor.id} value={doctor.id}>
                                    {doctor.fullName}
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
                        <Button type="primary" onClick={loadDoctors} loading={loading}>
                            Làm mới dữ liệu
                        </Button>
                    </Col>
                </Row>
            </div>

            <Table
                columns={columns}
                dataSource={filteredDoctors}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{
                    emptyText: loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu bác sĩ'
                }}
                scroll={{ x: 'max-content' }}
                size="middle"
                bordered
                responsive={true}
            />

            {/* Modal cập nhật thông tin bác sĩ */}
            {selectedDoctor && (
                <UpdateDoctorModal
                    visible={isUpdateModalVisible}
                    doctor={selectedDoctor}
                    onCancel={() => setIsUpdateModalVisible(false)}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {/* Modal xem chi tiết bác sĩ */}
            {selectedDoctor && (
                <DoctorProfileDetail
                    visible={isProfileDetailVisible}
                    doctor={selectedDoctor}
                    onClose={() => setIsProfileDetailVisible(false)}
                    loading={detailLoading}
                />
            )}
        </div>
    );
};

export default DoctorManagement;
