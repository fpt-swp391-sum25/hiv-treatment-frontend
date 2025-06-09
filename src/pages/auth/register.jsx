import '@ant-design/v5-patch-for-react-19';
import { Form, Input, Button, DatePicker, Select, message, Divider, Typography, notification } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { registerAPI } from '../../services/api.service';

const { Option } = Select;
const { Link, Text } = Typography;
const dateFormat = 'DD-MM-YYYY';


const Register = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const onFinish = async (values) => {
        const response = await registerAPI(values)
        setError('Success');
        if (response.data) {
            notification.success({
                message: 'Đăng kí thành công'
            })
        }
        navigate('/login');
        return response.data;
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Please correct the errors in the form before submitting.');
    };

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
            <Link href="/"><ArrowLeftOutlined /> Về trang chủ</Link>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng kí</h2>
            <Form
                form={form}
                name="register"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}

            >
                <Form.Item
                    label="Họ và tên"
                    name="fullname"
                    rules={[{ required: true, message: 'Hãy nhập tên của bạn' }]}
                >
                    <Input placeholder="Họ và tên" />
                </Form.Item>

                <Form.Item
                    label="Giới tính"
                    name="gender"
                    rules={[{ required: true, message: 'Hãy chọn giới tính của bạn' }]}
                >
                    <Select placeholder="Giới tính">
                        <Option value="male">Nam</Option>
                        <Option value="female">Nữ</Option>
                        <Option value="other">Khác</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Ngày sinh"
                    name="dob"
                    rules={[{ required: true, message: 'Hãy điền ngày sinh của bạn' }]}
                >
                    <DatePicker style={{ width: '100%' }} placeholder="Ngày sinh" format={dateFormat} />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Hãy nhập email của bạn' },
                        { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                        { required: true, message: 'Hãy nhập số điện thoại của bạn' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' },
                    ]}
                >
                    <Input placeholder="Số điện thoại" />
                </Form.Item>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: 'Hãy nhập địa chỉ của bạn' }]}
                >
                    <Input.TextArea placeholder="Địa chỉ" autoSize={{ minRows: 2, maxRows: 4 }} />
                </Form.Item>

                <Form.Item
                    label="Tên đăng nhập"
                    name="username"
                    rules={[
                        { required: true, message: 'Hãy nhập tên đăng nhập của bạn' },
                        { min: 4, message: 'Tên đăng nhập phải có ít nhất 4 chữ cái' },
                    ]}
                >
                    <Input placeholder="Tên đăng nhập" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[
                        { required: true, message: 'Hãy nhập mật khẩu của bạn' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 kí tự' },
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder="Mật khẩu" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Đăng kí
                    </Button>
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                    <Divider style={{ borderColor: 'black' }} >
                        <Text style={{ fontSize: '15px' }}>Đã có tài khoản? </Text>
                        <Link href="/login" style={{ fontSize: '15px' }}>Đăng nhập ngay</Link>
                    </Divider>
                </div>
            </Form>
        </div>
    );
};

export default Register;

