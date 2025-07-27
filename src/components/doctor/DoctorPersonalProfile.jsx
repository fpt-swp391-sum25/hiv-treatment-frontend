import {
  useState,
  useEffect,
  useContext
} from 'react';
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  notification,
  message,
  Typography,
  Card,
  Select,
  Avatar,
  Tooltip,
} from 'antd';
import {
  SaveOutlined
} from '@ant-design/icons';
import {
  fetchDoctorByIdAPI,
  updateDoctorProfileAPI,
} from '../../services/doctorProfile.service';
import {
  fetchAccountAPI,
} from '../../services/auth.service';
import {
  updateUserAPI
} from '../../services/user.service';
import {
  AuthContext
} from '../context/AuthContext';

const { Title } = Typography;

const DoctorPersonalProfile = ({ validateField }) => {
  const { user, setUser } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [doctorProfile, setDoctorProfile] = useState({
    id: '',
    startYear: '',
    background: '',
    biography: '',
    licenseNumber: '',
    qualifications: '',
    doctorId: ''
  });
  const [editableUser, setEditableUser] = useState({
    id: '',
    fullName: '',
    address: '',
    gender: '',
    accountStatus: '',
    phoneNumber: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    dateOfBirth: '',
    createdAt: '',
    isVerified: false,
    role: '',
  });

  useEffect(() => {
    if (user?.id) {
      setEditableUser({
        id: user.id,
        fullName: user.fullName || '',
        address: user.address || '',
        gender: user.gender || '',
        accountStatus: user.accountStatus || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        username: user.username || '',
        password: '',
        confirmPassword: '',
        avatar: user.avatar || '',
        dateOfBirth: user.dateOfBirth || '',
        createdAt: user.createdAt || '',
        isVerified: user.isVerified || false,
        role: user.role?.name || '',
      });
      loadDoctorProfile(user.id);
    }
  }, [user]);

  const handleChange = (field, value) => {
    const updatedUser = {
      ...editableUser,
      [field]: value,
    };

    let newErrors = { ...errors };

    if (field === "password") {
      newErrors.password = validateField("newPassword", value);
    } else if (field === "confirmPassword") {
      newErrors.confirmPassword = validateField("confirmPassword", value, {
        newPassword: updatedUser.password,
      });
    } else {
      newErrors[field] = validateField(field, value, updatedUser);
    }

    setEditableUser(updatedUser);
    setErrors(newErrors);
  };

  const loadDoctorProfile = async (doctorId) => {
    try {
      const response = await fetchDoctorByIdAPI(doctorId);
      if (response.data) {
        setDoctorProfile({
          id: response.data.id,
          startYear: response.data.startYear || '',
          background: response.data.background || '',
          biography: response.data.biography || '',
          licenseNumber: response.data.licenseNumber || '',
          qualifications: response.data.qualifications || '',
          doctorId: doctorId || ''
        });
      } else {
        notification.error({
          message: 'Hệ thống',
          showProgress: true,
          pauseOnHover: true,
          description: 'Không thể tải thông tin bác sĩ',
        });
      }
    } catch {
      notification.error({
        message: 'Hệ thống',
        showProgress: true,
        pauseOnHover: true,
        description: 'Đã xảy ra lỗi khi tải thông tin',
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const isChangingPassword = editableUser.password.trim().length > 0;
      if (isChangingPassword && editableUser.password !== editableUser.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp');
        return;
      }

      const userToUpdate = {
        id: editableUser.id,
        fullName: editableUser.fullName,
        address: editableUser.address,
        gender: editableUser.gender,
        accountStatus: editableUser.accountStatus,
        phoneNumber: editableUser.phoneNumber,
        email: editableUser.email,
        username: editableUser.username,
        avatar: editableUser.avatar,
        dateOfBirth: editableUser.dateOfBirth,
        createdAt: editableUser.createdAt,
        isVerified: editableUser.isVerified,
        role: { name: editableUser.role },
      };

      if (isChangingPassword) {
        userToUpdate.password = editableUser.password;
      }

      const doctorRes = await updateDoctorProfileAPI(doctorProfile.id, doctorProfile);
      const userRes = await updateUserAPI(editableUser.id, userToUpdate);

      if (doctorRes.data && userRes.data) {
        notification.success({
          message: 'Hệ thống',
          showProgress: true,
          pauseOnHover: true,
          description: 'Cập nhật thông tin thành công',
        });
        const updatedUserRes = await fetchAccountAPI(editableUser.id);
        if (updatedUserRes.data) {
          setEditableUser({
            ...editableUser,
            ...updatedUserRes.data,
            password: '',
            confirmPassword: '',
          });
          setUser(updatedUserRes.data);
        }
      } else {
        notification.error({
          message: 'Hệ thống',
          showProgress: true,
          pauseOnHover: true,
          description: 'Cập nhật thông tin không thành công',
        });
      }
    } catch {
      message.error('Cập nhật thất bại');
    }
  };

  return (
    <div className="personal-info-container">
      <Card
        title={<Title level={4}>Thông tin cá nhân</Title>}
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleUpdate}
            disabled={
              editableUser.password &&
              editableUser.confirmPassword &&
              editableUser.password !== editableUser.confirmPassword
            }
          >
            Cập nhật
          </Button>
        }
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email}
              >
                <Input
                  value={editableUser.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </Form.Item>

            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                validateStatus={errors.phoneNumber ? 'error' : ''}
                help={errors.phoneNumber}
              >
                <Input
                  value={editableUser.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                />
              </Form.Item>

            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giới tính">
                <Select
                  value={editableUser.gender}
                  onChange={value => setEditableUser(prev => ({ ...prev, gender: value }))}
                  placeholder="Chọn giới tính"
                >
                  <Select.Option value="Nam">Nam</Select.Option>
                  <Select.Option value="Nữ">Nữ</Select.Option>
                  <Select.Option value="Khác">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mật khẩu mới"
                validateStatus={errors.password ? 'error' : ''}
                help={errors.password}
              >
                <Input.Password
                  value={editableUser.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Chỉ nhập nếu muốn thay đổi"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Địa chỉ">
                <Input
                  value={editableUser.address}
                  onChange={(e) =>
                    setEditableUser((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Xác nhận mật khẩu"
                validateStatus={errors.confirmPassword ? 'error' : ''}
                help={errors.confirmPassword}
              >
                <Input.Password
                  value={editableUser.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Năm bắt đầu làm việc">
                <Input
                  type="number"
                  value={doctorProfile.startYear}
                  onChange={(e) =>
                    setDoctorProfile((prev) => ({
                      ...prev,
                      startYear: e.target.value,
                    }))
                  }
                  readOnly
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Trình độ chuyên môn">
                <Input
                  value={doctorProfile.background}
                  onChange={(e) =>
                    setDoctorProfile((prev) => ({
                      ...prev,
                      background: e.target.value,
                    }))
                  }
                  readOnly
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số giấy phép hành nghề">
                <Input
                  value={doctorProfile.licenseNumber}
                  onChange={(e) =>
                    setDoctorProfile((prev) => ({
                      ...prev,
                      licenseNumber: e.target.value,
                    }))
                  }
                  readOnly
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Bằng cấp chuyên môn">
                <Input
                  value={doctorProfile.qualifications}
                  onChange={(e) =>
                    setDoctorProfile((prev) => ({
                      ...prev,
                      qualifications: e.target.value,
                    }))
                  }
                  readOnly
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Giới thiệu">
            <Input.TextArea
              rows={4}
              value={doctorProfile.biography}
              onChange={(e) =>
                setDoctorProfile((prev) => ({
                  ...prev,
                  biography: e.target.value,
                }))
              }
            />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
export default DoctorPersonalProfile;
