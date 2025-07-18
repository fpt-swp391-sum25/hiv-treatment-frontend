import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";
import { validateField } from "../../utils/validate";

const { Title } = Typography;

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const handleChange = (field, value) => {
        const updatedForm = { ...formData, [field]: value };
        setFormData(updatedForm);
        const error = validateField(field, value, updatedForm);
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const handleSubmit = async () => {
        const newErrors = {
            newPassword: validateField("newPassword", formData.newPassword),
            confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData),
        };

        setErrors(newErrors);

        const isValid = Object.values(newErrors).every((e) => !e);
        if (!isValid) return;

        if (!token) {
            message.error("Token không tồn tại hoặc đã hết hạn.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post("/api/auth/reset-password", {
                token,
                newPassword: formData.newPassword,
            });

            message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
            navigate("/login");
        } catch (err) {
            message.error(
                err?.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
            <Title level={3}>Đặt lại mật khẩu</Title>

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
    );
};

export default ResetPassword;
