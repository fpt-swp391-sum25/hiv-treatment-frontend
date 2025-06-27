import React from 'react';
import { Modal, Descriptions, Avatar, Row, Col, Card } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import '../DoctorManagement/DoctorProfileDetail.css';

const LabTechnicianDetail = ({ visible, labTechnician, onCancel }) => {
    if (!labTechnician) {
        return null;
    }
    
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
            width={700}
            className="doctor-profile-detail"
        >
            <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: '0 0 200px', textAlign: 'center' }}>
                    <Avatar 
                        size={120} 
                        icon={<UserOutlined />}
                        src={labTechnician.avatarUrl} 
                        className="avatar"
                    />
                    <h3 className="fullname" style={{ marginTop: '16px' }}>{labTechnician.fullName}</h3>
                    <p className="role">Nhân viên xét nghiệm</p>
                </div>
                
                <div style={{ flex: '1 1 auto' }}>
                    <Card title="Thông tin cá nhân" className="info-card" bodyStyle={{ padding: 0 }}>
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
                        </Descriptions>
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

export default LabTechnicianDetail; 