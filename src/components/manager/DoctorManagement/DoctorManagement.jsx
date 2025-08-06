import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Tag, Row, Col, Card, Statistic, Select, Input, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import UpdateDoctorModal from './UpdateDoctorModal';
import { fetchAllDoctorsAPI } from '../../../services/user.service';
import { fetchDoctorByIdAPI, fetchDoctorProfileByDoctorIdAPI } from '../../../services/doctorProfile.service';
import '../../../styles/manager/DoctorManagement.css';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
    const [selectedDoctorId] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);

    const loadDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetchAllDoctorsAPI();

            if (Array.isArray(response)) {
                setDoctors(response);
            } else if (response && Array.isArray(response.data)) {
                setDoctors(response.data);
            } else {
                setDoctors([]);
                setError('Định dạng dữ liệu không đúng. Vui lòng thử lại sau.');
            }
        } catch {
            setError('Không thể tải dữ liệu bác sĩ. Vui lòng thử lại sau.');
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    const handleUpdateSuccess = () => {
        setIsProfileDetailVisible(false);
        loadDoctors();
    };

    const handleViewProfile = async (doctor) => {
        try {
            setDetailLoading(true);

            const basicInfoRes = await fetchDoctorByIdAPI(doctor.id);

            let combinedData = doctor;

            if (basicInfoRes && basicInfoRes.data) {
                combinedData = {
                    ...doctor,
                    ...basicInfoRes.data
                };
            }

            try {
                const profileRes = await fetchDoctorProfileByDoctorIdAPI(doctor.id);

                if (profileRes && profileRes.data) {
                    combinedData = {
                        ...combinedData,
                        ...profileRes.data,
                        doctorProfileId: profileRes.data.id
                    };
                }
            } catch (profileError) {
                error.warn('Không tìm thấy thông tin hồ sơ bác sĩ:', profileError);
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

    const handleEditProfile = async (doctor) => {
        setDetailLoading(true);
        try {
            const doctorRes = await fetchDoctorByIdAPI(doctor.id);
            let combinedDoctor = { ...doctor };

            if (doctorRes?.data) {
                combinedDoctor = { ...combinedDoctor, ...doctorRes.data };
            }

            const profileRes = await fetchDoctorProfileByDoctorIdAPI(doctor.id);
            if (profileRes?.data) {
                combinedDoctor = {
                    ...combinedDoctor,
                    ...profileRes.data,
                    doctorProfileId: profileRes.data.id
                };
            }

            setSelectedDoctor(combinedDoctor);
        } catch (error) {
            console.error('Lỗi khi tải thông tin chuyên môn:', error);
            message.error('Không thể tải thông tin chuyên môn');
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const matchDoctor = selectedDoctorId === 'all' || (doctor.id && doctor.id.toString() === selectedDoctorId.toString());
        const matchName = doctor.fullName && doctor.fullName.toLowerCase().includes(searchText.toLowerCase());
        return matchDoctor && matchName;
    });

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
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
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

            {selectedDoctor && (
                <UpdateDoctorModal
                    visible={isProfileDetailVisible}
                    doctor={selectedDoctor}
                    onClose={() => setIsProfileDetailVisible(false)}
                    onCancel={() => setIsProfileDetailVisible(false)}
                    loading={detailLoading}
                    onEditProfile={handleEditProfile}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
};

export default DoctorManagement;
