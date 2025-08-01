import {
    useContext,
    useEffect,
    useState
} from 'react';
import '@ant-design/v5-patch-for-react-19';
import {
    Form,
    Input,
    Button,
    Alert,
    Typography,
    Divider,
    notification,
} from 'antd';
import {
    useGoogleLogin
} from '@react-oauth/google';
import {
    GoogleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import {
    useNavigate
} from 'react-router-dom';
import {
    useForm
} from 'antd/es/form/Form';
import {
    AuthContext
} from '../../components/context/AuthContext';
import {
    validateField
} from '../../utils/validate';
import {
    googleLoginAPI,
    loginAPI,
    resendVerifyEmailAPI,
    sendResetPasswordAPI
} from '../../services/auth.service';

const { Link, Text } = Typography

const Login = () => {
    const [form] = useForm()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [showResend, setShowResend] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const { user, setUser } = useContext(AuthContext)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const authError = localStorage.getItem('auth_error')
        if (authError) {
            if (authError.includes('thành công')) {
                notification.success({
                    message: 'Hệ thống',
                    showProgress: true,
                    pauseOnHover: true,
                    description: authError
                })
            } else {
                notification.error({
                    message: 'Hệ thống',
                    showProgress: true,
                    pauseOnHover: true,
                    description: authError
                })
            }
            localStorage.removeItem('auth_error')
        }
<<<<<<< HEAD
        if (user && (user.role === 'ADMIN' 
            || user.role === 'MANAGER' 
            || user.role === 'LAB_TECHNICIAN' 
=======
        if (user && (user.role === 'ADMIN'
            || user.role === 'MANAGER'
            || user.role === 'LAB_TECHNICIAN'
>>>>>>> 5f3e4d16fc5d27323b351001a6224b2ef692baa8
            || user.role === 'DOCTOR'
            || user.role === 'CASHIER'
        )) {
            redirectHomePage()
        }
    }, [])

    const handleLogin = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await loginAPI(username, password)
            console.log('Login response:', response)

            if (response.data && response.data.token) {
                // Save token to local storage
                localStorage.setItem('access_token', response.data.token)
                setUser(response.data)

                // Navigate to right page by role
                if (response.data.role === 'ADMIN') {
                    navigate('/admin')
                } else if (response.data.role === 'LAB_TECHNICIAN') {
                    navigate('/lab-technician')
                } else if (response.data.role === 'DOCTOR') {
                    navigate('/doctor')
                } else if (response.data.role === 'MANAGER') {
                    navigate('/manager')
                } else if (response.data.role === 'CASHIER') {
                    navigate('/cashier')
                } else {
                    navigate('/')
                }

                notification.success({
                    message: "Đăng nhập thành công",
                    showProgress: true,
                    pauseOnHover: true,
                    description: `Xin chào, ${response.data.fullName || username}!`
                })
            } else {
                if (response.status === 403
                    && response.message.includes('NOT VERIFIED')) {
                    setError('Tài khoản chưa xác minh email')
                    setShowResend(true)
                } else if (response.status === 403
                    && response.message.includes('UNACTIVE')) {
                    setError('Tài khoản của bạn đã bị tạm khóa')
                } else {
                    setError('Thông tin đăng nhập không hợp lệ.')
                }
            }
        } catch (error) {
            console.error('Login error:', error)

            if (error.response) {
                const errorMessage = error.response.data?.message
                    || 'Thông tin đăng nhập không hợp lệ!'
                setError(errorMessage)
            } else {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.')
            }

            notification.error({
                message: "Lỗi đăng nhập",
                showProgress: true,
                pauseOnHover: true,
                description: error.response?.data?.message
                    || 'Thông tin đăng nhập không hợp lệ!'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        scope: 'profile email',
        onSuccess: async (codeResponse) => {
            try {
                setLoading(true)
                const response = await googleLoginAPI({ code: codeResponse.code })

                if (response.data?.token) {
                    localStorage.setItem('access_token', response.data.token)
                    setUser(response.data)

                    notification.success({
                        message: "Đăng nhập thành công",
                        showProgress: true,
                        pauseOnHover: true,
                        description: `Xin chào, ${response.data.fullName
                            || 'người dùng'}!`,
                        duration: 3
                    })
                    navigate("/")
                } else {
                    throw new Error(response.message
                        || "Không nhận được token từ server")
                }
            } catch (error) {
                const errorMessage = error?.response?.data?.message
                    || 'Đăng nhập bằng Google thất bại!'
                setError(errorMessage)
                notification.error({
                    message: 'Lỗi đăng nhập',
                    description: errorMessage,
                    duration: 3
                })
            } finally {
                setLoading(false)
            }
        },
        onError: () => {
            setError('Không thể xác thực với Google')
            notification.error({
                message: 'Lỗi đăng nhập',
                showProgress: true,
                pauseOnHover: true,
                description: 'Không thể xác thực với Google'
            })
        }
    })

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

    const handleResend = async () => {
        const response = await resendVerifyEmailAPI(email)
        if (response.data) {
            notification.success({
                message: "Hệ thống",
                showProgress: true,
                pauseOnHover: true,
                description: 'Đã gửi email xác minh'
            })
        } else {
            notification.error({
                message: "Hệ thống",
                showProgress: true,
                pauseOnHover: true,
                description: 'Lỗi khi gửi email xác minh'
            })
        }
    }

    const handleForgotPassword = async () => {
        setLoading(true)
        const response = await sendResetPasswordAPI(email)
        if (response.data) {
            notification.success({
                message: "Hệ thống",
                showProgress: true,
                pauseOnHover: true,
                description: 'Đã gửi email đổi mật khẩu'
            })
        } else if (response.status === 404) {
            notification.error({
                message: "Hệ thống",
                showProgress: true,
                pauseOnHover: true,
                description: 'Không tìm thấy email'
            })
        } else {
            notification.error({
                message: "Hệ thống",
                showProgress: true,
                pauseOnHover: true,
                description: 'Lỗi khi gửi email đổi mật khẩu'
            })
        }
        setLoading(false)
    }

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
            {showForgotPassword ? (
                <>
                    <div>
                        <Link
                            onClick={() => { setShowForgotPassword(false) }}
                            className='link'><ArrowLeftOutlined />
                            Quay lại trang đăng nhập
                        </Link>
                    </div>
                    <h2
                        style={{ textAlign: 'center', margin: 24 }}>
                        Quên mật khẩu
                    </h2>
                    <Form
                        form={form}
                        name='forgotPasswordForm'
                        onFinish={handleForgotPassword}
                        layout='vertical'
                    >
                        <Form.Item
                            label='Email đăng kí'
                            name='email'
                            rules={[
                                {
                                    validator: (_, value) => {
                                        const error = validateField('email', value)
                                        if (error) return Promise.reject(error)
                                        return Promise.resolve()
                                    },
                                },
                            ]}
                        >
                            <Input
                                placeholder='Nhập email của bạn'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            >

                            </Input>
                        </Form.Item>
                        <Form.Item >
                            <Button type='primary' htmlType="submit" block loading={loading}>Đặt lại mật khẩu</Button>
                        </Form.Item>
                    </Form>
                </>
            ) : showResend ? (
                <>
                    <div>
                        <Link
                            onClick={() => { setShowResend(false) }}
                            className='link'><ArrowLeftOutlined />
                            Quay lại trang đăng nhập
                        </Link>
                    </div>
                    {error &&
                        <Alert
                            message={error}
                            type="error"
                            style={{ marginTop: 20 }}
                        />}
                    <Form
                        form={form}
                        name="resendVerificationForm"
                        onFinish={handleResend}
                        layout="vertical"
                        style={{ marginTop: 20 }}
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email của bạn' },
                                { type: 'email', message: 'Email không hợp lệ' },
                            ]}
                        >
                            <Input
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={{ background: '#00bed3', borderColor: '#00bed3' }}
                            >
                                Gửi lại email xác minh
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            ) : (
                <>
                    <Link onClick={redirectHomePage} className='link'><ArrowLeftOutlined /> Về trang chủ</Link>
                    <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng nhập</h2>
                    {error &&
                        <Alert
                            message={error}
                            type="error"
                            style={{ marginBottom: 16 }}
                        />}
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
                            rules={[{
                                required: true,
                                message: 'Hãy nhập tên đăng nhập của bạn'
                            }]}
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
                        <div style={{ textAlign: 'left', marginBottom: '15px', marginTop: '-15px' }}>
                            <Link onClick={() => { setShowForgotPassword(true) }} className='link'> Quên mật khẩu?</Link>
                        </div>
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
                </>
            )}
        </div >
    )
}
export default Login

