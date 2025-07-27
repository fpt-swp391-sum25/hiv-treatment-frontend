import { 
    useState 
} from "react"
import { 
    Form, 
    Input,
    Button, 
    Typography, 
    notification, 
    Result 
} from "antd"
import { 
    useSearchParams, 
    Link 
} from "react-router-dom"
import { 
    validateField 
} from "../../utils/validate"
import { 
    resetPasswordAPI 
} from "../../services/auth.service"
import Paragraph from "antd/es/skeleton/Paragraph"
import { 
    CheckCircleFilled 
} from "@ant-design/icons"

const { Title } = Typography

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")

    const handleChange = (field, value) => {
        const updatedForm = { ...formData, [field]: value }
        setFormData(updatedForm)
        const error = validateField(field, value, updatedForm)
        setErrors((prev) => ({ ...prev, [field]: error }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        const response = await resetPasswordAPI(formData.newPassword, token)
        if (response.data.includes('successfully')) {
            setSuccess(true)
        } else {
            notification.error({
                message: "Lỗi",
                showProgress: true,
                pauseOnHover: true,
                description: errors.response?.data?.message || 'Đổi mật khẩu thất bại'
            })
        }
        setLoading(false)
    }

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
            <Title level={3} style={{ textAlign: 'center' }}>Đặt lại mật khẩu</Title>
            {success ? (
                <div style={{
                    minHeight: '500px',
                    display: 'flex',
                    maxWidth: 1000,
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #e6f7fa, #d9f7e8)',
                    padding: '24px'
                }}>
                    <Result
                        icon={<CheckCircleFilled style={{ color: '#52c41a', fontSize: '48px' }} />}
                        status="success"
                        title={<Title level={3}>Đổi mật khẩu thành công!</Title>}
                        subTitle={
                            <Paragraph style={{ color: '#595959' }}>
                                Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại để tiếp tục.
                            </Paragraph>
                        }
                        extra={[
                            <Link to="/login" key="login">
                                <Button type="primary" size="large" style={{ borderRadius: '8px' }}>
                                    Về trang đăng nhập
                                </Button>
                            </Link>
                        ]}
                        style={{
                            background: '#fff',
                            padding: '32px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            maxWidth: '500px',
                            width: '100%',
                            animation: 'fadeIn 0.5s ease-in-out'
                        }}
                    />
                </div>
            ) : (
                <div style={{ maxWidth: 400, margin: '0 auto' }}>
                    <Form layout="vertical">
                        <Form.Item
                            label="Mật khẩu mới"
                            validateStatus={errors.newPassword ? "error" : ""}
                            help={errors.newPassword}
                        >
                            <Input.Password
                                value={formData.newPassword}
                                onChange={(e) => handleChange("newPassword", e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu"
                            validateStatus={errors.confirmPassword ? "error" : ""}
                            help={errors.confirmPassword}
                        >
                            <Input.Password
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                onBlur={(e) => handleChange("confirmPassword", e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" loading={loading} onClick={handleSubmit} block>
                                Xác nhận
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </div>
    )
}
export default ResetPassword
