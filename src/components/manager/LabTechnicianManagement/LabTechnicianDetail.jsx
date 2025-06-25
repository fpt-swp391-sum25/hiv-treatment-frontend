import React from 'react';
import { Modal, Descriptions, Avatar, Row, Col, Card, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import '../DoctorManagement/DoctorProfileDetail.css';

const LabTechnicianDetail = ({ visible, labTechnician, onCancel }) => {
    if (!labTechnician) {
        return null;
    }
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'green';
            case 'INACTIVE': return 'red';
            case 'SUSPENDED': return 'orange';
            default: return 'blue';
        }
    };
    
    const getStatusText = (status) => {
        switch (status) {
            case 'ACTIVE': return 'Đang hoạt động';
            case 'INACTIVE': return 'Không hoạt động';
            case 'SUSPENDED': return 'Tạm khóa';
            default: return status;
        }
    };
    
    const getGenderText = (gender) => {
        switch (gender) {
            case 'MALE': return 'Nam';
            case 'FEMALE': return 'Nữ';
            case 'OTHER': return 'Khác';
            default: return gender;
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <Modal
            title="Thông tin chi tiết nhân viên xét nghiệm"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={720}
            className="doctor-profile-detail"
        >
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8} className="profile-avatar">
                    <Avatar 
                        size={120} 
                        icon={<UserOutlined />}
                        src={labTechnician.avatarUrl} 
                        className="avatar"
                    />
                    <h3 className="fullname">{labTechnician.fullName}</h3>
                    <p className="role">Nhân viên xét nghiệm</p>
                    <Tag color={getStatusColor(labTechnician.status)}>
                        {getStatusText(labTechnician.status)}
                    </Tag>
                </Col>
                
                <Col xs={24} md={16}>
                    <Card title="Thông tin cá nhân" className="info-card">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Họ và tên">
                                {labTechnician.fullName || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {labTechnician.email || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {labTechnician.phone || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {getGenderText(labTechnician.gender)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {formatDate(labTechnician.dateOfBirth)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {labTechnician.address || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên đăng nhập">
                                {labTechnician.username || 'Chưa cập nhật'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {formatDate(labTechnician.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái xác thực">
                                {labTechnician.isVerified ? 
                                    <Tag color="green">Đã xác thực</Tag> : 
                                    <Tag color="red">Chưa xác thực</Tag>
                                }
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
};

export default LabTechnicianDetail; 