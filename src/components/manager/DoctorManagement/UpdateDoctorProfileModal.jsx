import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, InputNumber, Spin } from 'antd';
import { updateDoctorProfileAPI, createDoctorProfileAPI } from '../../../services/api.service';

const UpdateDoctorProfileModal = ({ visible, doctor, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isNewProfile, setIsNewProfile] = useState(false);

    // Log thông tin khi doctor prop thay đổi
    useEffect(() => {
        if (visible && doctor) {
            console.log('UpdateDoctorProfileModal received doctor data:', doctor);
            
            // Kiểm tra xem bác sĩ đã có profile hay chưa
            setIsNewProfile(!doctor.doctorProfileId);
            
            // Set các giá trị form từ dữ liệu doctor nhận được
            form.setFieldsValue({
                licenseNumber: doctor.licenseNumber || '',
                startYear: doctor.startYear || '',
                qualifications: doctor.qualifications || '',
                biography: doctor.biography || '',
                background: doctor.background || '',
            });
            
            console.log('Form values set:', form.getFieldsValue());
        }
    }, [visible, doctor, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            // Lấy doctorId
            const doctorId = doctor.doctor?.id || doctor.id;
            
            console.log('Doctor ID:', doctorId);
            console.log('Is new profile:', isNewProfile);
            console.log('Form data:', values);
            
            // Tạo dữ liệu để gửi lên server
            const profileData = {
                ...values,
                doctorId: doctorId, // Luôn gửi kèm doctorId
            };
            
            let response;
            
            if (isNewProfile) {
                // Tạo mới profile nếu chưa có
                console.log('Creating new doctor profile with data:', profileData);
                response = await createDoctorProfileAPI(profileData);
                message.success('Tạo mới thông tin chuyên môn thành công');
            } else {
                // Cập nhật profile nếu đã có
                const doctorProfileId = doctor.doctorProfileId || doctor.id;
                console.log('Updating existing profile ID:', doctorProfileId);
                response = await updateDoctorProfileAPI(doctorProfileId, profileData);
                message.success('Cập nhật thông tin chuyên môn thành công');
            }
            
            console.log('API response:', response);
            
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            console.error('Error updating doctor profile:', error);
            
            // Xử lý thông báo lỗi cụ thể
            if (error.response) {
                const status = error.response.status;
                if (status === 404) {
                    message.error('Không tìm thấy hồ sơ bác sĩ (404)');
                } else if (status === 400) {
                    message.error('Dữ liệu không hợp lệ: ' + (error.response.data?.message || 'Lỗi 400'));
                } else {
                    message.error(`Lỗi ${status}: ${error.response.data?.message || 'Không thể cập nhật hồ sơ bác sĩ'}`);
                }
            } else {
                message.error('Lỗi khi cập nhật hồ sơ: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isNewProfile ? "Tạo mới thông tin chuyên môn" : "Cập nhật thông tin chuyên môn"}
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel} disabled={loading}>
                    Hủy
                </Button>,
                <Button 
                    key="submit" 
                    type="primary" 
                    loading={loading} 
                    onClick={handleSubmit}
                >
                    {isNewProfile ? "Tạo mới" : "Cập nhật"}
                </Button>
            ]}
            width={720}
            destroyOnClose
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin />
                    <p>Đang {isNewProfile ? 'tạo mới' : 'cập nhật'} thông tin...</p>
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="licenseNumber"
                        label="Số giấy phép hành nghề"
                    >
                        <Input placeholder="Nhập số giấy phép hành nghề" />
                    </Form.Item>

                    <Form.Item
                        name="startYear"
                        label="Năm bắt đầu hành nghề"
                    >
                        <Input 
                            placeholder="Nhập năm bắt đầu hành nghề (ví dụ: 2010)" 
                        />
                    </Form.Item>

                    <Form.Item
                        name="qualifications"
                        label="Bằng cấp/Chứng chỉ"
                    >
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Nhập thông tin về bằng cấp, chứng chỉ chuyên môn" 
                        />
                    </Form.Item>

                    <Form.Item
                        name="background"
                        label="Nền tảng chuyên môn"
                    >
                        <Input.TextArea 
                            rows={3} 
                            placeholder="Nhập thông tin về nền tảng chuyên môn, đào tạo" 
                        />
                    </Form.Item>

                    <Form.Item
                        name="biography"
                        label="Tiểu sử"
                    >
                        <Input.TextArea 
                            rows={4} 
                            placeholder="Nhập thông tin tiểu sử, kinh nghiệm làm việc" 
                        />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default UpdateDoctorProfileModal; 