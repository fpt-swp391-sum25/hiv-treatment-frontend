import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Tag, Row, Col, Card, Statistic, Spin, Select, Input } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { fetchAllDoctorsAPI, fetchDoctorByIdAPI, updateDoctorProfileAPI, fetchDoctorStatisticsAPI } from '../../../services/api.service';
import UpdateDoctorModal from './UpdateDoctorModal';
import DoctorProfileDetail from './DoctorProfileDetail';
import { DoctorStatus } from '../../../types/doctor.types';
import './DoctorManagement.css';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
    const [doctorStatistics, setDoctorStatistics] = useState(null);
    const [statisticsLoading, setStatisticsLoading] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setLoading(true);
        setApiError(null);
        try {
            console.log('Fetching doctors from API...');
            const response = await fetchAllDoctorsAPI();
            console.log('API response:', response);
            
            // Kiểm tra cả response.data và response trực tiếp (tùy thuộc vào cấu trúc API)
            const doctorsData = response.data || response || [];
            const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
            
            console.log('Doctors data after processing:', doctorsList);
            
            if (doctorsList.length > 0) {
                // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
                const formattedDoctors = doctorsList.map(doctor => {
                    // Log để kiểm tra cấu trúc dữ liệu
                    console.log('Doctor data structure:', doctor);
                    
                    return {
                        id: doctor.id,
                        fullName: doctor.full_name || doctor.username || `BS. ${doctor.id}`,
                        specialty: doctor.specialty || 'HIV/AIDS',
                        email: doctor.email || '',
                        phone: doctor.phone_number || '',
                        status: doctor.account_status || 'ACTIVE',
                        experienceLevel: doctor.experience_level || 'SENIOR',
                        description: doctor.description || '',
                        certificates: doctor.certificates || '',
                        education: doctor.education || '',
                        avatarUrl: doctor.avatar || '',
                    };
                });
                
                console.log('Formatted doctors:', formattedDoctors);
                setDoctors(formattedDoctors);
            } else {
                console.log('No doctor data received');
                setDoctors([]);
                setApiError('Không có dữ liệu bác sĩ từ server');
            }
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setDoctors([]);
            setApiError('Không thể tải danh sách bác sĩ từ server');
            message.error('Không thể tải danh sách bác sĩ');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = async (doctor) => {
        setSelectedDoctor(null);
        setStatisticsLoading(true);
        try {
            // Lấy chi tiết bác sĩ
            const detailRes = await fetchDoctorByIdAPI(doctor.id);
            setSelectedDoctor(detailRes.data);
            // Lấy thống kê
            const statsRes = await fetchDoctorStatisticsAPI(doctor.id);
            setDoctorStatistics(statsRes.data);
            setIsProfileDetailVisible(true);
        } catch (error) {
            message.error('Không thể tải thông tin chi tiết bác sĩ');
        } finally {
            setStatisticsLoading(false);
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
        const matchDoctor = selectedDoctorId === 'all' || doctor.id === selectedDoctorId;
        const matchName = doctor.fullName.toLowerCase().includes(searchText.toLowerCase());
        return matchDoctor && matchName;
    });

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Chuyên khoa',
            dataIndex: 'specialty',
            key: 'specialty',
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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'green';
                let text = 'Đang hoạt động';
                if (status === DoctorStatus.INACTIVE) {
                    color = 'red';
                    text = 'Tạm nghỉ';
                } else if (status === DoctorStatus.ON_LEAVE) {
                    color = 'orange';
                    text = 'Nghỉ phép';
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
                    <Button onClick={() => handleUpdateDoctor(record)}>
                        Cập nhật
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="doctor-management">
            <Row gutter={[16, 16]} className="dashboard-stats">
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Tổng số bác sĩ"
                            value={doctors.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Đang làm việc"
                            value={doctors.filter(d => d.status === DoctorStatus.ACTIVE).length}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Nghỉ phép"
                            value={doctors.filter(d => d.status === DoctorStatus.ON_LEAVE).length}
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
                        <Input.Search
                            placeholder="Tìm kiếm theo tên"
                            allowClear
                            onSearch={(value) => setSearchText(value)}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={8} className="text-right">
                        <Button type="primary" onClick={loadDoctors}>
                            Làm mới dữ liệu
                        </Button>
                    </Col>
                </Row>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {apiError && (
                        <div className="error-message">
                            <p>{apiError}</p>
                        </div>
                    )}
                    <Table
                        columns={columns}
                        dataSource={filteredDoctors}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </>
            )}

            {selectedDoctor && (
                <UpdateDoctorModal
                    visible={isUpdateModalVisible}
                    onCancel={() => setIsUpdateModalVisible(false)}
                    doctor={selectedDoctor}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}

            {selectedDoctor && (
                <DoctorProfileDetail
                    visible={isProfileDetailVisible}
                    onCancel={() => setIsProfileDetailVisible(false)}
                    doctor={selectedDoctor}
                    statistics={doctorStatistics}
                    statisticsLoading={statisticsLoading}
                />
            )}
        </div>
    );
};

export default DoctorManagement;
