import React from 'react';
import { Modal, Descriptions, Tag, Spin, Row, Col, Card, Statistic, Button } from 'antd';
import { UserOutlined, ClockCircleOutlined, TeamOutlined, EditOutlined } from '@ant-design/icons';
import './DoctorProfileDetail.css';

const DoctorProfileDetail = ({ visible, onCancel, doctor, statistics, loading, onUpdate }) => {
    if (!doctor) return null;

    // Kiểm tra và xử lý dữ liệu thống kê
    const statsData = statistics || {
        totalPatients: 0,
        workingHours: 0,
        averageRating: 0
    };

    return (
        <Modal
            title="Thông tin chi tiết bác sĩ"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Đóng
                </Button>,
                <Button 
                    key="update" 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={onUpdate}
                >
                    Cập nhật
                </Button>
            ]}
            width={800}
            className="doctor-profile-modal"
        >
            {loading ? (
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <div className="profile-header">
                        <div className="avatar-section">
                            {doctor.avatarUrl ? (
                                <img src={doctor.avatarUrl} alt="Doctor avatar" className="doctor-avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <UserOutlined />
                                </div>
                            )}
                        </div>
                        <div className="basic-info">
                            <h2>{doctor.fullName}</h2>
                            <p>{doctor.specialty || 'HIV/AIDS'}</p>
                            <Tag color="blue">{doctor.experienceLevel || 'Chuyên gia'}</Tag>
                        </div>
                    </div>

                    <Row gutter={16} className="statistics-section">
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Số bệnh nhân đã khám"
                                    value={statsData.totalPatients || statsData.appointmentsCount || 0}
                                    prefix={<TeamOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Lịch hoàn thành"
                                    value={statsData.completedCount || 0}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Lịch đã hủy"
                                    value={statsData.cancelledCount || 0}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Descriptions
                        bordered
                        column={1}
                        className="doctor-details"
                    >
                        <Descriptions.Item label="Email">
                            {doctor.email || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {doctor.phone || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chuyên khoa">
                            {doctor.specialty || 'HIV/AIDS'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kinh nghiệm">
                            {doctor.experienceLevel || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {doctor.description || 'Chưa có mô tả'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Học vấn">
                            {doctor.education || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chứng chỉ">
                            {doctor.certificates || 'Chưa cập nhật'}
                        </Descriptions.Item>
                    </Descriptions>
                </>
            )}
        </Modal>
    );
};

export default DoctorProfileDetail;
