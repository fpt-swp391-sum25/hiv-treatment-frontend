import dayjs from "dayjs";

export const validateField = (field, value, extra = {}) => {
    switch (field) {
        case "fullName":
            if (!value || !value.trim()) return "Họ và tên không được để trống";
            return "";

        case "email":
            if (!value || !value.trim()) return "Email không được để trống";
            if (!/^\S+@\S+\.\S+$/.test(value)) return "Email không hợp lệ";
            return "";

        case "phoneNumber":
            if (!value.trim()) return "Số điện thoại không được để trống";
            if (!/^(03[2-9]|07[06-9]|08[1-5]|09[0|1|3|4|6-8])\d{7}$/.test(value)) return "Số điện thoại không hợp lệ";
            return "";


        case "dateOfBirth":
            if (!value) return "Ngày sinh không được để trống";
            if (dayjs(value).isAfter(dayjs())) return "Ngày sinh không được lớn hơn hôm nay";
            return "";

        case "newPassword":
            if (value && value.length < 6) return "Mật khẩu mới ít nhất 6 ký tự";
            return "";

        case "confirmPassword":
            if (extra.newPassword && value !== extra.newPassword) return "Mật khẩu xác nhận không khớp";
            return "";
        case "username":
            if (!value || !value.trim()) return "Tên đăng nhập không được để trống";
            if (value.length < 4) return "Tên đăng nhập phải có ít nhất 4 ký tự";
            return "";

        default:
            return "";
    }
};

export const validateMultipleFields = (fields, data) => {
    const errors = {};

    fields.forEach((field) => {
        const value = field === "dateOfBirth" ? data[field] : data[field] || "";
        const error = validateField(field, value, data);
        if (error) errors[field] = error;
    });

    return errors;
};

export const isValid = (errors) => {
    return Object.values(errors).every((err) => !err);
};
