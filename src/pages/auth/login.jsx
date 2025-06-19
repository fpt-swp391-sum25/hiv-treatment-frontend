import { useContext, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Form, Input, Button, Alert, Segmented, Typography, Divider, notification } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../services/api.service';
import { AuthContext } from '../../components/context/AuthContext';
import { useForm } from 'antd/es/form/Form';

const { Link, Text } = Typography;

const Login = () => {
    const form = useForm()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const handleLogin = async () => {
        try {
            const response = await loginAPI(username, password)
            setError('Success');
            if (response.data.token) {
                localStorage.setItem('access_token', response.data.token);

                navigate(response.data.role === 'ADMIN' ? '/admin' : '/');
            } else {
                notification.error({
                    message: "Lỗi đăng nhập",
                    description: JSON.stringify(response.message)
                })
            }
            // return response.data;
        } catch (err) {
            setError('Thông tin đăng nhập không hợp lệ!');
        }
    };

    const login = useGoogleLogin({
        onSuccess: codeResponse => console.log(codeResponse),
        flow: 'auth-code',
    });

    const [userType, setUserType] = useState('Bệnh nhân')


    return (

        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
            <Link href="/"><ArrowLeftOutlined /> Về trang chủ</Link>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng nhập</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Segmented
                    value={userType}
                    style={{ marginBottom: 8 }}
                    onChange={setUserType}
                    options={['Bệnh nhân', 'Nhân viên']}
                />
            </div>
            {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}


            {userType === 'Bệnh nhân' ? (
                <Form
                    name="loginForm"
                    onFinish={handleLogin}
                    layout="vertical"
                >
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập tên đăng nhập của bạn' }]}
                    >
                        <Input placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập mật khẩu của bạn' }]}
                    >
                        <Input.Password placeholder="Mật khẩu" onKeyDown={(event) => {
                            if (event.key === 'Enter') form.submit()
                        }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Divider style={{ borderColor: 'black' }} >
                            <Text style={{ fontSize: '15px' }}>Chưa có tài khoản? </Text>
                            <Link href="/register" style={{ fontSize: '15px' }}>Đăng kí ngay</Link>
                        </Divider>
                    </div>
                    <div style={{ textAlign: 'center', paddingBottom: '15px' }}>
                        <Text style={{ fontSize: '13px', color: 'gray' }}>Hoặc</Text>
                    </div>

                    <div style={{ textAlign: 'center' }}>

                        <Button onClick={() => login()}><GoogleOutlined />Đăng nhập với Google</Button>
                    </div>
                </Form>
            ) : (
                <Form
                    name="loginForm"
                    onFinish={handleLogin}
                    layout="vertical"
                >
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập tên đăng nhập của bạn' }]}
                    >
                        <Input placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập mật khẩu của bạn' }]}
                    >
                        <Input.Password placeholder="Mật khẩu" onKeyDown={(event) => {
                            if (event.key === 'Enter') form.submit()
                        }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div >
    );
};

export default Login;

