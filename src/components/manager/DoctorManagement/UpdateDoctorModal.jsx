import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { updateUserAPI } from '../../../services/api.service';

const UpdateDoctorModal = ({ visible, doctor, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && doctor) {
            form.setFieldsValue({
                fullName: doctor.fullName || '',
                email: doctor.email || '',
                phoneNumber: doctor.phoneNumber || '',
                gender: doctor.gender || 'MALE',
                address: doctor.address || '',
            });
        }
    }, [visible, doctor, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            console.log('Updating doctor with ID:', doctor.id);
            console.log('Update data:', values);
            
            // Chuyển đổi dữ liệu để phù hợp với API
            const updateData = {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phoneNumber,
                gender: values.gender,
                address: values.address
            };
            
            const response = await updateUserAPI(doctor.id, updateData);
            console.log('Update response:', response);
            
            if (onSuccess) {
                onSuccess();
            }
            message.success('Cập nhật thông tin bác sĩ thành công');
        } catch (error) {
            console.error('Error updating doctor:', error);
            if (error.response) {
                message.error(`Lỗi: ${error.response.status} - ${error.response.data?.message || 'Không thể cập nhật thông tin bác sĩ'}`);
            } else {
                message.error('Không thể cập nhật thông tin bác sĩ');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Cập nhật thông tin bác sĩ"
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
                    name="phoneNumber"
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
                    name="address"
                    label="Địa chỉ"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateDoctorModal;
