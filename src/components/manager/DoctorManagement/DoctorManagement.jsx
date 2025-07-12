import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Tag, Row, Col, Card, Statistic, Select, Input, Alert } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import {
    fetchAllDoctorsAPI,
    fetchDoctorByIdAPI,
    fetchDoctorProfileByDoctorIdAPI
} from '../../../services/api.service';
import UpdateDoctorModal from './UpdateDoctorModal';
import DoctorProfileDetail from './DoctorProfileDetail';
import UpdateDoctorProfileModal from './UpdateDoctorProfileModal';
import './DoctorManagement.css';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
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
                console.log('Doctors data (array):', response);
                response.forEach(doctor => console.log('Doctor gender:', doctor.gender));
                setDoctors(response);
            } else if (response && Array.isArray(response.data)) {
                // Trường hợp API trả về object có thuộc tính data là mảng
                console.log('Doctors data (object.data):', response.data);
                response.data.forEach(doctor => console.log('Doctor gender:', doctor.gender));
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
            console.log('Lấy thông tin chi tiết của bác sĩ có ID:', doctor.id);
            setDetailLoading(true);

            // Lấy thông tin cơ bản của bác sĩ
            const basicInfoRes = await fetchDoctorByIdAPI(doctor.id);
            console.log('Thông tin cơ bản bác sĩ:', basicInfoRes);

            let combinedData = doctor;

            // Nếu có dữ liệu cơ bản từ API
            if (basicInfoRes && basicInfoRes.data) {
                combinedData = {
                    ...doctor,
                    ...basicInfoRes.data
                };
            }

            try {
                // Lấy thông tin doctor_profile theo doctorId
                const profileRes = await fetchDoctorProfileByDoctorIdAPI(doctor.id);
                console.log('Thông tin doctor_profile:', profileRes);

                if (profileRes && profileRes.data) {
                    // Kết hợp thông tin cơ bản và thông tin chuyên môn
                    combinedData = {
                        ...combinedData,
                        ...profileRes.data,
                        // Lưu ID của profile để sử dụng khi cập nhật
                        doctorProfileId: profileRes.data.id
                    };
                    console.log('Đã kết hợp dữ liệu với doctor_profile:', combinedData);
                }
            } catch (profileError) {
                console.warn('Không tìm thấy thông tin doctor_profile:', profileError);
                // Không gây lỗi toàn bộ quá trình nếu không tìm thấy profile
            }

            setSelectedDoctor(combinedData);

        } catch (error) {
            console.error('Lỗi khi lấy thông tin chi tiết bác sĩ:', error);
            message.error('Không thể tải thông tin chi tiết của bác sĩ');
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

    const handleEditProfile = (doctor) => {
        console.log('Edit profile button clicked, opening modal for doctor:', doctor);
        setSelectedDoctor(doctor);
        setIsProfileModalVisible(true);
    };

    const handleUpdateSuccess = async () => {
        try {
            message.success('Đang làm mới dữ liệu...');

            // Tải lại danh sách bác sĩ
            await loadDoctors();

            // Nếu đang xem thông tin chi tiết của bác sĩ, cập nhật lại thông tin chi tiết
            if (selectedDoctor && isProfileDetailVisible) {
                try {
                    const detailRes = await fetchDoctorByIdAPI(selectedDoctor.id);
                    console.log('Tải lại thông tin chi tiết:', detailRes);

                    if (detailRes && detailRes.data) {
                        // Tìm thông tin cơ bản mới nhất từ danh sách bác sĩ
                        const updatedBasicInfo = doctors.find(d => d.id === selectedDoctor.id) || selectedDoctor;

                        // Cập nhật thông tin chi tiết
                        const updatedDoctor = {
                            ...updatedBasicInfo,
                            ...detailRes.data
                        };

                        console.log('Thông tin bác sĩ đã được cập nhật:', updatedDoctor);
                        setSelectedDoctor(updatedDoctor);
                    }
                } catch (error) {
                    console.error('Lỗi khi tải lại thông tin chi tiết:', error);
                }
            }

            message.success('Cập nhật thông tin thành công');
        } catch (error) {
            console.error('Lỗi khi làm mới dữ liệu:', error);
        } finally {
            setIsUpdateModalVisible(false);
            setIsProfileModalVisible(false);
        }
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
            title: '',
            key: 'action',
            fixed: 'right',
            width: '15%',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewProfile(record)}
                    >
                        Xem chi tiết
                    </Button>

                    <Button
                        type='default'
                        size="small"

                        onClick={() => handleUpdateDoctor(record)}
                    >
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
                <Col xs={24}>
                    <Card>
                        <Statistic
                            title="Tổng số bác sĩ"
                            value={filteredDoctors.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="doctor-filters">
                <Row gutter={16} align="middle">
                    {/* <Col xs={24} md={12}>
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
                    </Col> */}
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

            {/* Modal cập nhật thông tin cơ bản bác sĩ */}
            {selectedDoctor && (
                <UpdateDoctorModal
                    visible={isUpdateModalVisible}
                    doctor={selectedDoctor}
                    onCancel={() => setIsUpdateModalVisible(false)}
                    onSuccess={handleUpdateSuccess}
                />
            )}

            {/* Modal cập nhật thông tin chuyên môn */}
            {selectedDoctor && (
                <UpdateDoctorProfileModal
                    visible={isProfileModalVisible}
                    doctor={selectedDoctor}
                    onCancel={() => setIsProfileModalVisible(false)}
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
                    onEditProfile={handleEditProfile}
                />
            )}
        </div>
    );
};

export default DoctorManagement;
