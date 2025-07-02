import React, { useEffect } from 'react';
import { Modal, Descriptions, Tag, Row, Col, Card, Statistic, Button, Spin } from 'antd';
import { UserOutlined, ClockCircleOutlined, TeamOutlined, EditOutlined } from '@ant-design/icons';
import './DoctorProfileDetail.css';

const DoctorProfileDetail = ({ visible, onClose, doctor, loading, onEditProfile }) => {
    // Debug log
    useEffect(() => {
        console.log('DoctorProfileDetail rendered:', { visible, doctor, loading });
    }, [visible, doctor, loading]);

    if (!doctor) return null;

    const handleClose = () => {
        console.log('Closing doctor profile modal');
        if (onClose) onClose();
    };
    
    const handleEditProfile = () => {
        console.log('Edit profile button clicked for doctor:', doctor);
        if (onEditProfile) onEditProfile(doctor);
    };

    // Kiểm tra xem có dữ liệu từ doctor_profile không
    const hasProfileData = doctor.licenseNumber || doctor.startYear || doctor.qualifications || 
                          doctor.biography || doctor.background;

    return (
        <Modal
            title="Thông tin chi tiết bác sĩ"
            open={visible}
            onCancel={handleClose}
            footer={[
                <Button 
                    key="edit" 
                    type="primary" 
                    icon={<EditOutlined />}
                    onClick={handleEditProfile}
                    style={{ marginRight: 8 }}
                >
                    Cập nhật thông tin chuyên môn
                </Button>,
                <Button key="back" onClick={handleClose}>
                    Đóng
                </Button>
            ]}
            width={800}
            className="doctor-profile-modal"
            maskClosable={true}
            destroyOnClose={true}
        >
            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                    <p>Đang tải thông tin chi tiết...</p>
                </div>
            ) : doctor ? (
                <>
                    <div className="profile-header">
                        <div className="avatar-section">
                            {doctor.avatar ? (
                                <img src={doctor.avatar} alt="Doctor avatar" className="doctor-avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <UserOutlined />
                                </div>
                            )}
                        </div>
                        <div className="basic-info">
                            <h2>{doctor.fullName || 'Không có tên'}</h2>
                            <p>Bác sĩ chuyên khoa HIV/AIDS</p>
                            <Tag color="blue">{doctor.role === 'DOCTOR' ? 'Bác sĩ' : 'Chuyên gia'}</Tag>
                            {doctor.startYear && (
                                <p>Kinh nghiệm từ năm {doctor.startYear}</p>
                            )}
                        </div>
                    </div>

                    <Row gutter={16} className="statistics-section">
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Số bệnh nhân đã khám"
                                    value={0}
                                    prefix={<TeamOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Lịch hoàn thành"
                                    value={0}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Lịch đã hủy"
                                    value={0}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Descriptions
                        bordered
                        column={1}
                        className="doctor-details"
                        title="Thông tin cá nhân"
                    >
                        <Descriptions.Item label="Email">
                            {doctor.email || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {doctor.phoneNumber || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            {doctor.gender === 'MALE' ? 'Nam' : doctor.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                            {doctor.address || 'Chưa cập nhật'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Descriptions
                        bordered
                        column={1}
                        className="doctor-details"
                        title="Thông tin chuyên môn"
                        style={{ marginTop: '20px' }}
                    >
                        <Descriptions.Item label="Số giấy phép hành nghề">
                            {doctor.licenseNumber || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm bắt đầu hành nghề">
                            {doctor.startYear || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bằng cấp/Chứng chỉ">
                            {doctor.qualifications || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nền tảng chuyên môn">
                            {doctor.background || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiểu sử">
                            {doctor.biography || 'Chưa cập nhật'}
                        </Descriptions.Item>
                    </Descriptions>
                </>
            ) : (
                <div className="loading-container">
                    <p>Không có thông tin bác sĩ</p>
                </div>
            )}
        </Modal>
    );
};

export default DoctorProfileDetail;
