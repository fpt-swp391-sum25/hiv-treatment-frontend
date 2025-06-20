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

    const mockDoctors = [
        {
            id: 1,
            fullName: 'BS. Nguyễn Văn A',
            specialty: 'HIV/AIDS',
            email: 'bsa@example.com',
            phone: '0901234567',
            status: 'ACTIVE',
            experienceLevel: 'SENIOR',
            description: 'Chuyên gia điều trị HIV/AIDS',
            certificates: 'Chứng chỉ A, B',
            education: 'Đại học Y Hà Nội',
            avatarUrl: '',
        },
        {
            id: 2,
            fullName: 'BS. Trần Thị B',
            specialty: 'HIV/AIDS',
            email: 'bsb@example.com',
            phone: '0912345678',
            status: 'ON_LEAVE',
            experienceLevel: 'EXPERT',
            description: 'Bác sĩ nội tổng quát nhiều năm kinh nghiệm',
            certificates: 'Chứng chỉ C',
            education: 'Đại học Y Dược TP.HCM',
            avatarUrl: '',
        },
        {
            id: 3,
            fullName: 'BS. Lê Văn C',
            specialty: 'HIV/AIDS',
            email: 'bsc@example.com',
            phone: '0987654321',
            status: 'INACTIVE',
            experienceLevel: 'JUNIOR',
            description: 'Bác sĩ trẻ, nhiệt huyết',
            certificates: '',
            education: 'Đại học Y Huế',
            avatarUrl: '',
        },
    ];

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const response = await fetchAllDoctorsAPI();
            let data = response.data || [];
            if (!data || data.length === 0) {
                data = mockDoctors;
            }
            setDoctors(data);
        } catch (error) {
            setDoctors(mockDoctors);
            message.error('Không thể tải danh sách bác sĩ, đang hiển thị dữ liệu mẫu');
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

            {/* Bộ lọc bác sĩ và search */}
            <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
                <Col xs={24} sm={12} md={8} lg={6}>
                    <label style={{ fontWeight: 500 }}>Bác sĩ:</label>
                    <Select
                        style={{ width: '100%' }}
                        value={selectedDoctorId}
                        onChange={setSelectedDoctorId}
                    >
                        <Select.Option value="all">Tất cả bác sĩ</Select.Option>
                        {doctors.map((doctor) => (
                            <Select.Option key={doctor.id} value={doctor.id}>
                                {doctor.fullName}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <label style={{ fontWeight: 500 }}>Tìm kiếm theo tên:</label>
                    <Input
                        placeholder="Nhập tên bác sĩ..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredDoctors}
                loading={loading}
                rowKey="id"
                className="doctor-table"
            />

            {selectedDoctor && (
                <>
                    <UpdateDoctorModal
                        visible={isUpdateModalVisible}
                        doctor={selectedDoctor}
                        onCancel={() => setIsUpdateModalVisible(false)}
                        onSuccess={handleUpdateSuccess}
                        updateDoctorProfileAPI={updateDoctorProfileAPI}
                    />
                    <DoctorProfileDetail
                        visible={isProfileDetailVisible}
                        doctor={selectedDoctor}
                        statistics={doctorStatistics}
                        loading={statisticsLoading}
                        onClose={() => setIsProfileDetailVisible(false)}
                    />
                </>
            )}
        </div>
    );
};

export default DoctorManagement;
