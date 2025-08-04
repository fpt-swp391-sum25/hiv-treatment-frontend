import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Upload,
  Avatar,
  Select,
  DatePicker,
  Space,
  Spin,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { updateUserAPI } from '../../../services/user.service';
import {
  updateDoctorProfileAPI,
} from '../../../services/doctorProfile.service';

const UpdateDoctorModal = ({ visible, doctor, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  const avatarPreview =
    avatarBase64 ??
    (isAvatarRemoved
      ? ''
      : doctor?.avatar
        ? doctor.avatar.startsWith('data:')
          ? doctor.avatar
          : `data:image/png;base64,${doctor.avatar}`
        : '');

  useEffect(() => {
    if (visible && doctor) {
      setAvatarBase64(null);
      setIsAvatarRemoved(false);

      form.setFieldsValue({
        fullName: doctor.fullName || '',
        email: doctor.email || '',
        phone: doctor.phoneNumber || '',
        gender: doctor.gender || '',
        address: doctor.address || '',
        dateOfBirth: doctor.dateOfBirth ? moment(doctor.dateOfBirth) : null,
        status: doctor.accountStatus || '',
        licenseNumber: doctor.licenseNumber || '',
        startYear: doctor.startYear || '',
        qualifications: doctor.qualifications || '',
        background: doctor.background || '',
        biography: doctor.biography || '',
      });
    }
  }, [visible, doctor, form]);

  const handleAvatarChange = (file) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
      message.error('Chỉ chấp nhận ảnh JPG hoặc PNG!');
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

    return false;
  };

  const handleRemoveAvatar = () => {
    setAvatarBase64(null);
    setIsAvatarRemoved(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateUserPayload = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phone,
        gender: values.gender,
        address: values.address,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : null,
        accountStatus: values.status,
        avatar: isAvatarRemoved
          ? ''
          : avatarBase64 !== null
            ? avatarBase64
            : undefined,
      };

      await updateUserAPI(doctor.id, updateUserPayload);

      const profilePayload = {
        licenseNumber: values.licenseNumber,
        startYear: values.startYear,
        qualifications: values.qualifications,
        background: values.background,
        biography: values.biography,
        doctorId: doctor.id,
      };

      await updateDoctorProfileAPI(doctor.doctorProfileId, profilePayload);
      message.success('Cập nhật thông tin bác sĩ thành công');

      onSuccess?.();
      onCancel?.();
    } catch (error) {
      console.error(error);
      message.error('Đã xảy ra lỗi khi cập nhật bác sĩ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cập nhật hồ sơ bác sĩ"
      open={visible}
      onCancel={onCancel}
      destroyOnClose
      width={720}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Cập nhật
        </Button>,
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <>
          <Space direction="vertical" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar
                key={avatarPreview || 'empty-avatar'}
                size={100}
                src={avatarPreview || null}
                icon={!avatarPreview && <UserOutlined />}
              />
              <Upload showUploadList={false} beforeUpload={handleAvatarChange}>
                <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
              </Upload>
              {avatarPreview && (
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={handleRemoveAvatar}
                >
                  Xóa ảnh
                </Button>
              )}
            </div>
          </Space>

          <Form layout="vertical" form={form}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Giới tính">
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
            <Form.Item name="status" label="Trạng thái">
              <Select>
                <Select.Option value="Đang hoạt động">Đang hoạt động</Select.Option>
                <Select.Option value="Tạm khóa">Tạm khóa</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Số giấy phép hành nghề" name="licenseNumber">
              <Input />
            </Form.Item>
            <Form.Item label="Năm bắt đầu hành nghề" name="startYear">
              <Input />
            </Form.Item>
            <Form.Item label="Bằng cấp/Chứng chỉ" name="qualifications">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Nền tảng chuyên môn" name="background">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Tiểu sử" name="biography">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default UpdateDoctorModal;
