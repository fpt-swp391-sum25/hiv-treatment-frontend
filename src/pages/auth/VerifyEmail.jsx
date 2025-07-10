import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { resendVerifyEmailAPI, verifyEmailAPI } from "../../services/api.service"
import { Input, Result, Typography, Form, notification, Spin, Button, Card, Row, Col } from "antd"
import '../../styles/global.css'


const { Text } = Typography


const VerifyEmail = () => {

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [email, setEmail] = useState("")

    useEffect(() => {
        handleVerify()
    }, [])

    const handleVerify = async () => {
        setLoading(true)
        const response = await verifyEmailAPI(token)
        if (response.data) {
            if (response.data.message === 'MAIL VERIFIED SUCCESSFULLY') {
                setMessage('SUCCESSED')
            } else {
                setMessage('FAILED')
            }
        }
        setLoading(false)
    }

    const handleResend = async () => {
        const response = await resendVerifyEmailAPI(email)
        if (response) {
            return (
                <>
                    <Result
                        status="success"
                        title="Đã gửi email xác minh"

                    />
                </>
            )
        } else {
            notification.error({
                message: "Hệ thống",
                showProgress: true,
                pauseOnHover: true,
                description: 'Lỗi khi gửi email xác minh'
            });
        }
    }

    return (
        <>
            {loading ? (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}>
                    <Spin tip="Đang xác minh....." />
                </div>

            ) : (
                <>
                    {message === 'SUCCESSED' && (
                        <Result
                            status="success"
                            title="Xác minh email thành công"
                            extra={[
                                <Text style={{ fontSize: '15px' }}>Đến trang </Text>,
                                <Link to="/login" style={{ fontSize: '15px' }} className='link'>đăng nhập</Link>
                            ]}
                        />
                    )}
                    {message === 'FAILED' && (
                        <Result
                            status="error"
                            title="Xác minh email không thành công"
                            extra={[
                                <Row style={{ justifyContent: 'center' }}>
                                    <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                                        <Form
                                            form={form}
                                            name="resendVerificationForm"
                                            onFinish={handleResend}
                                            layout="vertical"
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
                                    </Col>
                                </Row>
                            ]}
                        />
                    )}
                </>
            )}
        </>
    )

}

export default VerifyEmail