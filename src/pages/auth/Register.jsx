import '@ant-design/v5-patch-for-react-19'
import {
    Form,
    Input,
    Button,
    DatePicker,
    Select,
    message as antdMessage,
    Divider,
    Typography,
    Alert,
    notification,
} from 'antd';
import {
    ArrowLeftOutlined
} from '@ant-design/icons';
import {
    registerAPI
} from '../../services/auth.service';
import {
    useState
} from 'react';
import {
    validateField
} from '../../utils/validate';

const { Option } = Select
const { Link, Text } = Typography
const dateFormat = 'DD-MM-YYYY'

const Register = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    const onFinish = async (values) => {
        setLoading(true)
        try {
            const response = await registerAPI(values)
            if (response.data) {
                setSuccessMessage(
                    'Đăng kí thành công, vui lòng xác minh email trước khi đăng nhập!'
                )
                form.resetFields()
            } else if (response.message.includes('USERNAME')) {
                notification.error({
                    message: "Hệ thống",
                    description: "Tên người dùng đã tồn tại",
                })
            }
        } catch {
            antdMessage.error('Đăng ký thất bại, vui lòng thử lại.')
        }
        setLoading(false)
    }

    const onFinishFailed = () => {
        antdMessage.error('Vui lòng kiểm tra lại thông tin.')
    }

    return (
        <div
            style={{
                maxWidth: 500,
                margin: '40px auto',
                padding: 24,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 8,
            }}
        >
            <Link href="/" className="link">
                <ArrowLeftOutlined /> Về trang chủ
            </Link>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng kí</h2>
            {successMessage && (
                <Alert
                    message={successMessage}
                    type="success"
                    style={{ marginBottom: 16 }}
                />
            )}
            <Form
                form={form}
                name="register"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    label={<span>Họ và tên <span 
                    style={{ color: 'red' }}>*</span></span>}
                    name="fullname"
                    rules={[
                        {
                            validator: (_, value) => {
                                const error = validateField('fullname', value)
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Input placeholder="Họ và tên" autoComplete="name" />
                </Form.Item>

                <Form.Item
                    label="Giới tính"
                    name="gender"
                    rules={[
                        {
                            validator: (_, value) => {
                                const error = validateField('gender', value)
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Select placeholder="Giới tính" allowClear>
                        <Option value="Nam">Nam</Option>
                        <Option value="Nữ">Nữ</Option>
                        <Option value="Khác">Khác</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Ngày sinh"
                    name="dob"
                    rules={[
                        {
                            validator: (_, value) => {
                                const error = validateField('dob', value)
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Ngày sinh"
                        format={dateFormat}
                    />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
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
                    <Input placeholder="Email" autoComplete="email" />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phoneNumber"
                    rules={[
                        {
                            validator: (_, value) => {
                                const error = validateField('phoneNumber', value)
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Input placeholder="Số điện thoại" autoComplete="tel" />
                </Form.Item>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[
                        {
                            validator: (_, value) => {
                                const error = validateField('address', value)
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Input.TextArea
                        placeholder="Địa chỉ"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                </Form.Item>

                <Form.Item
                    label="Tên đăng nhập"
                    name="username"
                    rules={[
                        {
                            validator: (_, value) => {
                                const error = validateField('username', value)
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Input placeholder="Tên đăng nhập" autoComplete="username" />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="newPassword"
                    rules={[
                        {
                            validator: (_, value) => {
                                const error = validateField('newPassword', value)
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        placeholder="Mật khẩu"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        {
                            validator: (_, value) => {
                                const password = form.getFieldValue('newPassword')
                                if (!value) return Promise.resolve()
                                const error = validateField('confirmPassword', value, { newPassword: password })
                                if (error) return Promise.reject(error)
                                return Promise.resolve()
                            },
                        },
                    ]}
                >
                    <Input.Password
                        placeholder="Xác nhận mật khẩu"
                        autoComplete="new-password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        className="btn-custom"
                        loading={loading}
                    >
                        Đăng kí
                    </Button>
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                    <Divider style={{ borderColor: 'black' }}>
                        <Text style={{ fontSize: '15px' }}>Đã có tài khoản? </Text>
                        <Link href="/login" style={{ fontSize: '15px' }} className="link">
                            {' '}
                            Đăng nhập ngay
                        </Link>
                    </Divider>
                </div>
            </Form>
        </div>
    )
}
export default Register
