import { useContext, useEffect, useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Form, Input, Button, Alert, Segmented, Typography, Divider, notification } from 'antd';
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { googleLoginAPI, loginAPI } from '../../services/api.service';
import { useForm } from 'antd/es/form/Form';
import { AuthContext } from '../../components/context/AuthContext';

const { Link, Text } = Typography;

const Login = () => {
    const form = useForm()
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { user, setUser } = useContext(AuthContext)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation()

    useEffect(() => {
        const authError = localStorage.getItem('auth_error');
        if (authError) {
            notification.error({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: authError
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
                setUser(response.data);

                // Kiểm tra xem có URL redirect không
                const redirectPath = localStorage.getItem('redirect_after_login');
                if (redirectPath) {
                    localStorage.removeItem('redirect_after_login');
                    navigate(redirectPath);
                } else {
                    // Điều hướng theo role
                    if (response.data.role === 'ADMIN') {
                        navigate('/admin');
                    } else if (response.data.role === 'LAB_TECHNICIAN') {
                        navigate('/lab-technician');
                    } else if (response.data.role === 'DOCTOR') {
                        navigate('/doctor');
                    } else if (response.data.role === 'MANAGER') {
                        navigate('/manager');
                    } else {
                        navigate('/');
                    }
                }

                notification.success({
                    message: "Đăng nhập thành công",
                    showProgress: true,
                    pauseOnHover: true,
                    description: `Xin chào, ${response.data.fullName || username}!`
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

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        scope: 'profile email',
        onSuccess: async (codeResponse) => {
            try {
                setLoading(true);
                const response = await googleLoginAPI({ code: codeResponse.code });

                if (response.data?.token) {
                    localStorage.setItem('access_token', response.data.token);
                    setUser(response.data);

                    notification.success({
                        message: "Đăng nhập thành công",
                        description: `Xin chào, ${response.data.name || 'người dùng'}!`,
                        duration: 3
                    });
                    navigate("/");
                } else {
                    throw new Error(response.message || "Không nhận được token từ server");
                }
            } catch (error) {
                const errorMessage = error?.response?.data?.message || 'Đăng nhập bằng Google thất bại!';
                setError(errorMessage);
                notification.error({
                    message: 'Lỗi đăng nhập',
                    description: errorMessage,
                    duration: 3
                });
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Không thể xác thực với Google');
            notification.error({
                message: 'Lỗi đăng nhập',
                description: 'Không thể xác thực với Google'
            });
        }
    });

    const redirectHomePage = () => {
        if (user) {
            if (user.role === "ADMIN") {
                navigate('/admin')
            } else if (user.role === "MANAGER") {
                navigate('/manager')
            } else if (user.role === 'LAB_TECHNICIAN') {
                navigate('/lab-technician')
            } else if (user.role === "DOCTOR") {
                navigate('/doctor')
            } else {
                navigate('/')
            }
        } else {
            navigate('/')
        }
    }


    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
            <Link onClick={redirectHomePage} className='link'><ArrowLeftOutlined /> Về trang chủ</Link>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng nhập</h2>
            {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
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
                    <Button type="primary" htmlType="submit" block loading={loading} className='btn-custom'>
                        Đăng nhập
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center' }}>
                    <Divider style={{ borderColor: 'black' }} >
                        <Text style={{ fontSize: '15px' }}>Chưa có tài khoản? </Text>
                        <Link href="/register" style={{ fontSize: '15px' }} className='link'>Đăng kí ngay</Link>
                    </Divider>
                </div>
                <div style={{ textAlign: 'center', paddingBottom: '15px' }}>
                    <Text style={{ fontSize: '13px', color: 'gray' }}>Hoặc</Text>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Button onClick={handleGoogleLogin} loading={loading}><GoogleOutlined />Đăng nhập với Google</Button>
                </div>
            </Form>
        </div >
    );
};

export default Login;

