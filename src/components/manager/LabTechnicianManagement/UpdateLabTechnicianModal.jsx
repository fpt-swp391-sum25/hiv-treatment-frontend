import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, DatePicker, Avatar, Upload, Space } from 'antd';
import { UploadOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { updateUserAPI } from '../../../services/user.service';

const UpdateLabTechnicianModal = ({ visible, labTechnician, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [avatarBase64, setAvatarBase64] = useState(null);
    const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

    // Tính avatar preview theo logic giống trang ManagerProfile
    const avatarPreview = avatarBase64
    ?? (isAvatarRemoved ? ''
    : labTechnician?.avatar
        ? labTechnician.avatar.startsWith('data:')
            ? labTechnician.avatar
            : `data:image/png;base64,${labTechnician.avatar}`
        : '');


    useEffect(() => {
        if (visible && labTechnician) {

            form.setFieldsValue({
                fullName: labTechnician.fullName || '',
                email: labTechnician.email || '',
                phone: labTechnician.phone || '',
                gender: labTechnician.gender || '',
                address: labTechnician.address || '',
                status: labTechnician.status || '',
                dateOfBirth: labTechnician.dateOfBirth ? moment(labTechnician.dateOfBirth, 'YYYY-MM-DD') : null
            });

            // Reset avatar state
            setAvatarBase64(null);
            setIsAvatarRemoved(false);
        }
    }, [visible, labTechnician, form]);

    const handleAvatarChange = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJpgOrPng) {
            message.error('Chỉ chấp nhận ảnh JPG/PNG!');
            return false;
        }
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
            return false;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarBase64(e.target.result);
            setIsAvatarRemoved(false);
        };
        reader.readAsDataURL(file);

        return false; // Ngăn không upload thật sự
    };

    const handleRemoveAvatar = () => {
        setAvatarBase64(null);
        setIsAvatarRemoved(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const updateData = {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phone,
                gender: values.gender,
                address: values.address,
                accountStatus: values.status,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
                avatar: isAvatarRemoved ? '' : avatarBase64 !== null ? avatarBase64 : undefined
            };

            await updateUserAPI(labTechnician.id, updateData);
            message.success('Cập nhật thông tin kỹ thuật viên phòng thí nghiệm thành công');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            message.error('Không thể cập nhật thông tin kỹ thuật viên phòng thí nghiệ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Cập nhật thông tin kỹ thuật viên phòng thí nghiệm"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>Hủy</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>Cập nhật</Button>
            ]}
            width={720}
        >
            <Space direction="vertical" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar
                        key={avatarPreview || 'empty-avatar'}
                        size={100}
                        src={avatarPreview}
                        icon={!avatarPreview && <UserOutlined />}
                    />
                    <Upload showUploadList={false} beforeUpload={handleAvatarChange}>
                        <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                    </Upload>
                    {avatarPreview && (
                        <Button icon={<DeleteOutlined />} danger onClick={handleRemoveAvatar}>
                            Xóa ảnh
                        </Button>
                    )}
                </div>
            </Space>

            <Form form={form} layout="vertical" initialValues={{ gender: 'Nam', status: 'Đang hoạt động' }}>
                <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
                    <Select>
                        <Select.Option value="Nam">Nam</Select.Option>
                        <Select.Option value="Nữ">Nữ</Select.Option>
                        <Select.Option value="Khác">Khác</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="dateOfBirth" label="Ngày sinh">
                    <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="address" label="Địa chỉ">
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
                    <Select>
                        <Select.Option value="Đang hoạt động">Đang hoạt động</Select.Option>
                        <Select.Option value="Tạm khóa">Tạm khóa</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateLabTechnicianModal;
