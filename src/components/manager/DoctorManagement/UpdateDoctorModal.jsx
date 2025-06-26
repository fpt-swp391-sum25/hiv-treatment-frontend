import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { DoctorSpecialty, ExperienceLevel } from '../../../types/doctor.types';
import { updateDoctorProfileAPI } from '../../../services/api.service';

const UpdateDoctorModal = ({ visible, doctor, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && doctor) {
            form.setFieldsValue({
                fullName: doctor.fullName || '',
                email: doctor.email || '',
                phone: doctor.phone || '',
                specialty: doctor.specialty || DoctorSpecialty.HIV_AIDS,
                experienceLevel: doctor.experienceLevel || ExperienceLevel.SENIOR,
                description: doctor.description || '',
                certificates: doctor.certificates || '',
                education: doctor.education || ''
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
            const profileData = {
                full_name: values.fullName,
                email: values.email,
                phone_number: values.phone,
                specialty: values.specialty,
                experience_level: values.experienceLevel,
                description: values.description,
                certificates: values.certificates,
                education: values.education
            };
            
            const response = await updateDoctorProfileAPI(doctor.id, profileData);
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
                initialValues={{ 
                    specialty: DoctorSpecialty.HIV_AIDS,
                    experienceLevel: ExperienceLevel.SENIOR
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
                    name="specialty"
                    label="Chuyên khoa"
                    rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa' }]}
                >
                    <Select>
                        {Object.entries(DoctorSpecialty).map(([key, value]) => (
                            <Select.Option key={key} value={value}>
                                {value}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="experienceLevel"
                    label="Kinh nghiệm"
                    rules={[{ required: true, message: 'Vui lòng chọn mức kinh nghiệm' }]}
                >
                    <Select>
                        {Object.entries(ExperienceLevel).map(([key, value]) => (
                            <Select.Option key={key} value={value}>
                                {value}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item
                    name="education"
                    label="Học vấn"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                    name="certificates"
                    label="Chứng chỉ"
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateDoctorModal;
