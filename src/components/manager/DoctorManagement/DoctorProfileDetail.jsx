import React from 'react';
import { Modal, Descriptions, Tag, Spin, Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import './DoctorProfileDetail.css';

const DoctorProfileDetail = ({ visible, doctor, statistics, loading, onClose }) => {
    if (!doctor) return null;
    // Xác định màu trạng thái
    let statusColor = 'green', statusText = 'Đang hoạt động';
    if (doctor.status === 'INACTIVE') {
        statusColor = 'red'; statusText = 'Tạm nghỉ';
    } else if (doctor.status === 'ON_LEAVE') {
        statusColor = 'orange'; statusText = 'Nghỉ phép';
    }
    return (
        <Modal
            title="Thông tin chi tiết bác sĩ"
            open={visible}
            onCancel={onClose}
            footer={null}
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
                            <p>{doctor.specialty}</p>
                            <Tag color={statusColor}>{statusText}</Tag>
                        </div>
                    </div>

                    {statistics && (
                        <Row gutter={16} className="statistics-section">
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Số bệnh nhân đã khám"
                                        value={statistics.totalPatients}
                                        prefix={<TeamOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Giờ làm việc"
                                        value={statistics.workingHours}
                                        prefix={<ClockCircleOutlined />}
                                        suffix="h"
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card>
                                    <Statistic
                                        title="Đánh giá trung bình"
                                        value={statistics.averageRating}
                                        precision={1}
                                        suffix="/5"
                                    />
                                </Card>
                            </Col>
                        </Row>
                    )}

                    <Descriptions
                        bordered
                        column={1}
                        className="doctor-details"
                    >
                        <Descriptions.Item label="Họ và tên">
                            {doctor.fullName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {doctor.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {doctor.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chuyên khoa">
                            {doctor.specialty}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số năm kinh nghiệm">
                            {doctor.experienceYears || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {doctor.description}
                        </Descriptions.Item>
                        <Descriptions.Item label="Học vấn">
                            {doctor.education}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chứng chỉ">
                            {doctor.certificates}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={statusColor}>{statusText}</Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </>
            )}
        </Modal>
    );
};

export default DoctorProfileDetail;
