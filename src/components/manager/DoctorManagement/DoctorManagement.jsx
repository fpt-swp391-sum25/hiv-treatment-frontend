import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Tag, Row, Col, Card, Statistic, Spin, Select, Input, Modal } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { fetchAllDoctorsAPI, fetchDoctorByIdAPI, updateDoctorProfileAPI, fetchDoctorStatisticsAPI, deleteDoctorAPI } from '../../../services/api.service';
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
            experienceYears: 12,
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
            experienceYears: 20,
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
            experienceYears: 3,
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
        setSelectedDoctor(doctor); // Sửa: luôn set doctor để truyền sang modal
        setStatisticsLoading(true);
        try {
            // Lấy chi tiết bác sĩ (nếu có API thật)
            let detail = doctor;
            if (doctor.id ) {
                const detailRes = await fetchDoctorByIdAPI(doctor.id);
                if (detailRes && detailRes.data) detail = detailRes.data;
            }
            setSelectedDoctor(detail);
            // Lấy thống kê
            let stats = null;
            if (doctor.id && fetchDoctorStatisticsAPI) {
                const statsRes = await fetchDoctorStatisticsAPI(doctor.id);
                if (statsRes && statsRes.data) stats = statsRes.data;
            }
            setDoctorStatistics(stats);
            setIsProfileDetailVisible(true);
        } catch (error) {
            setIsProfileDetailVisible(true); // Vẫn mở modal với dữ liệu hiện có
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
        message.success({
            content: 'Cập nhật thông tin thành công',
            duration: 2,
            style: { top: 80, right: 24, position: 'fixed' }
        });
        loadDoctors();
        setIsUpdateModalVisible(false);
    };

    const handleDelete = (doctor) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn xóa bác sĩ ${doctor.fullName}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    setLoading(true);
                    await deleteDoctorAPI(doctor.id);
                    message.success('Xóa bác sĩ thành công');
                    // Cập nhật lại danh sách
                    await loadDoctors();
                } catch (error) {
                    console.error('Error deleting doctor:', error);
                    // Nếu dùng mock data, xóa trực tiếp
                    const newDoctors = doctors.filter(d => d.id !== doctor.id);
                    setDoctors(newDoctors);
                    message.success('Xóa bác sĩ thành công (dữ liệu mẫu)');
                } finally {
                    setLoading(false);
                }
            },
        });
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
        // {
        //     title: 'Trạng thái',
        //     dataIndex: 'status',
        //     key: 'status',
        //     render: (status) => {
        //         let color = 'green';
        //         let text = 'Đang hoạt động';
        //         if (status === DoctorStatus.INACTIVE) {
        //             color = 'red';
        //             text = 'Tạm nghỉ';
        //         } else if (status === DoctorStatus.ON_LEAVE) {
        //             color = 'orange';
        //             text = 'Nghỉ phép';
        //         }
        //         return <Tag color={color}>{text}</Tag>;
        //     }
        // },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleViewProfile(record)}>
                        Xem thông tin
                    </Button>
                    <Button onClick={() => handleUpdateDoctor(record)}>
                        Cập nhật
                    </Button>
                    <Button onClick={() => handleDelete(record)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="doctor-management">
            <Row gutter={[24, 24]} className="dashboard-stats" style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
                            background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
                            minHeight: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        bodyStyle={{ padding: 24, textAlign: 'center' }}
                    >
                        <Statistic
                            title={<span style={{ color: '#64748b', fontWeight: 600, fontSize: 16 }}>Tổng số bác sĩ</span>}
                            value={doctors.length}
                            prefix={<UserOutlined style={{ fontSize: 32, color: '#2563eb', marginRight: 8 }} />}
                            valueStyle={{ fontSize: 32, fontWeight: 700, color: '#22223b' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
                            background: 'linear-gradient(135deg, #f8fafc 60%, #d1fae5 100%)',
                            minHeight: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        bodyStyle={{ padding: 24, textAlign: 'center' }}
                    >
                        <Statistic
                            title={<span style={{ color: '#64748b', fontWeight: 600, fontSize: 16 }}>Đang làm việc</span>}
                            value={doctors.filter(d => d.status === DoctorStatus.ACTIVE).length}
                            prefix={<CalendarOutlined style={{ fontSize: 32, color: '#059669', marginRight: 8 }} />}
                            valueStyle={{ fontSize: 32, fontWeight: 700, color: '#22223b' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
                            background: 'linear-gradient(135deg, #f8fafc 60%, #fef9c3 100%)',
                            minHeight: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        bodyStyle={{ padding: 24, textAlign: 'center' }}
                    >
                        <Statistic
                            title={<span style={{ color: '#64748b', fontWeight: 600, fontSize: 16 }}>Nghỉ phép</span>}
                            value={doctors.filter(d => d.status === DoctorStatus.ON_LEAVE).length}
                            prefix={<FileTextOutlined style={{ fontSize: 32, color: '#eab308', marginRight: 8 }} />}
                            valueStyle={{ fontSize: 32, fontWeight: 700, color: '#22223b' }}
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
