import { useContext, useEffect, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Form, Input, Button, Alert, Segmented, Typography, Divider, notification } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../../services/api.service';
import { useForm } from 'antd/es/form/Form';
import { AuthContext } from '../../components/context/AuthContext';

const { Link, Text } = Typography;

const Login = () => {
    const form = useForm()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { authUser, setAuthUser, setUser } = useContext(AuthContext)
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        const authError = localStorage.getItem('auth_error');
        if (authError) {
            notification.error({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            });
            localStorage.removeItem('auth_error');
        }
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await loginAPI(username, password)
            console.log('Login response:', response);

            if (response.data && response.data.token) {
                // Lưu token trực tiếp vào localStorage
                localStorage.setItem('access_token', response.data.token);
                setUser(response.data)
                navigate(response.data.role === 'ADMIN' ? '/admin' : '/');

                // Kiểm tra xem có URL redirect không
                const redirectPath = localStorage.getItem('redirect_after_login');
                if (redirectPath) {
                    localStorage.removeItem('redirect_after_login');
                    navigate(redirectPath);
                } else {
                    // Điều hướng theo role
                    navigate(response.data.role === 'ADMIN' ? '/admin' : '/');
                }

                notification.success({
                    message: "Đăng nhập thành công",
                    showProgress: true,
                    pauseOnHover: true,
                    description: `Xin chào, ${response.data.name || username}!`
                });
            } else {
                notification.error({
                    message: "Lỗi đăng nhập",
                    showProgress: true,
                    pauseOnHover: true,
                    description: response.message || "Không nhận được token từ server"
                });
                setError('Không nhận được token đăng nhập. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                // Hiển thị thông báo lỗi cụ thể từ server
                const errorMessage = error.response.data?.message || 'Thông tin đăng nhập không hợp lệ!';
                setError(errorMessage);
            } else {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
            }

            notification.error({
                message: "Lỗi đăng nhập",
                showProgress: true,
                pauseOnHover: true,
                description: error.response?.data?.message || 'Thông tin đăng nhập không hợp lệ!'
            });
        } finally {
            setLoading(false);
        }
    };

    const login = useGoogleLogin({
        onSuccess: codeResponse => console.log(codeResponse),
        flow: 'auth-code',
    });

    const [userType, setUserType] = useState('Bệnh nhân')


    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
            <Link href="/"><ArrowLeftOutlined /> Về trang chủ</Link>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng nhập</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Segmented
                    value={userType}
                    style={{ marginBottom: 8 }}
                    onChange={setUserType}
                    options={['Bệnh nhân', 'Nhân viên']}
                />
            </div>
            {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}


            {userType === 'Bệnh nhân' ? (
                <Form
                    name="loginForm"
                    onFinish={handleLogin}
                    layout="vertical"
                >
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập tên đăng nhập của bạn' }]}
                    >
                        <Input placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập mật khẩu của bạn' }]}
                    >
                        <Input.Password placeholder="Mật khẩu" onKeyDown={(event) => {
                            if (event.key === 'Enter') form.submit()
                        }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Divider style={{ borderColor: 'black' }} >
                            <Text style={{ fontSize: '15px' }}>Chưa có tài khoản? </Text>
                            <Link href="/register" style={{ fontSize: '15px' }}>Đăng kí ngay</Link>
                        </Divider>
                    </div>
                    <div style={{ textAlign: 'center', paddingBottom: '15px' }}>
                        <Text style={{ fontSize: '13px', color: 'gray' }}>Hoặc</Text>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Button onClick={() => login()}><GoogleOutlined />Đăng nhập với Google</Button>
                    </div>
                </Form>
            ) : (
                <Form
                    name="loginForm"
                    onFinish={handleLogin}
                    layout="vertical"
                >
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập tên đăng nhập của bạn' }]}
                    >
                        <Input placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        rules={[{ required: true, message: 'Hãy nhập mật khẩu của bạn' }]}
                    >
                        <Input.Password placeholder="Mật khẩu" onKeyDown={(event) => {
                            if (event.key === 'Enter') form.submit()
                        }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div >
    );
};

export default Login;

