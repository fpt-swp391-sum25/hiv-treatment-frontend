import '@ant-design/v5-patch-for-react-19';
import { Form, Input, Button, DatePicker, Select, message, Divider, Typography, notification, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { registerAPI } from '../../services/api.service';
import { useState } from 'react';

const { Option } = Select;
const { Link, Text } = Typography;
const dateFormat = 'DD-MM-YYYY';


const Register = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const onFinish = async (values) => {
        setLoading(true)
        const response = await registerAPI(values)
        if (response.data) {
            setMessage('Đăng kí thành công, vui lòng xác minh email trước khi đăng nhập!')
        }
        setLoading(false)
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
        message.error('Please correct the errors in the form before submitting.');
    };

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
            <Link href="/" className='link'><ArrowLeftOutlined /> Về trang chủ</Link>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng kí</h2>
            {message && <Alert message={message} type="success" style={{ marginBottom: 16 }} />}
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
                        <Option value="Nam">Nam</Option>
                        <Option value="Nữ">Nữ</Option>
                        <Option value="Khác">Khác</Option>
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
                    name="phoneNumber"
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
                    <Button type="primary" htmlType="submit" block className='btn-custom' loading={loading}>
                        Đăng kí
                    </Button>
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                    <Divider style={{ borderColor: 'black' }} >
                        <Text style={{ fontSize: '15px' }}>Đã có tài khoản? </Text>
                        <Link href="/login" style={{ fontSize: '15px' }} className='link'> Đăng nhập ngay</Link>
                    </Divider>
                </div>
            </Form>
        </div>
    );
};

export default Register;

