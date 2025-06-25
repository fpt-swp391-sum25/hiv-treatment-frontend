import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message, DatePicker } from 'antd';
import { updateUserAPI } from '../../../services/api.service';
import moment from 'moment';

const UpdateLabTechnicianModal = ({ visible, labTechnician, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && labTechnician) {
            // Đặt giá trị cho form từ dữ liệu nhân viên
            form.setFieldsValue({
                fullName: labTechnician.fullName || '',
                email: labTechnician.email || '',
                phone: labTechnician.phone || '',
                gender: labTechnician.gender || 'MALE',
                address: labTechnician.address || '',
                status: labTechnician.status || 'ACTIVE',
                dateOfBirth: labTechnician.dateOfBirth ? moment(labTechnician.dateOfBirth, 'YYYY-MM-DD') : null
            });
        }
    }, [visible, labTechnician, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            console.log('Updating lab technician with ID:', labTechnician.id);
            console.log('Update data:', values);
            
            // Chuyển đổi dữ liệu để phù hợp với API
            const updateData = {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phone,
                gender: values.gender,
                address: values.address,
                accountStatus: values.status,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
            };
            
            const response = await updateUserAPI(labTechnician.id, updateData);
            console.log('Update response:', response);
            
            if (onSuccess) {
                onSuccess();
            }
            message.success('Cập nhật thông tin nhân viên thành công');
        } catch (error) {
            console.error('Error updating lab technician:', error);
            if (error.response) {
                message.error(`Lỗi: ${error.response.status} - ${error.response.data?.message || 'Không thể cập nhật thông tin nhân viên'}`);
            } else {
                message.error('Không thể cập nhật thông tin nhân viên');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Cập nhật thông tin nhân viên xét nghiệm"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    loading={loading} 
                    onClick={handleSubmit}
                >
                    Cập nhật
                </Button>
            ]}
            width={720}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ 
                    gender: 'MALE',
                    status: 'ACTIVE'
                }}
            >
                <Form.Item
                    name="fullName"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                >
                    <Select>
                        <Select.Option value="MALE">Nam</Select.Option>
                        <Select.Option value="FEMALE">Nữ</Select.Option>
                        <Select.Option value="OTHER">Khác</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="dateOfBirth"
                    label="Ngày sinh"
                >
                    <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Địa chỉ"
                >
                    <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                    <Select>
                        <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                        <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
                        <Select.Option value="SUSPENDED">Tạm khóa</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateLabTechnicianModal; 