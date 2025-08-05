import {
    Button,
    DatePicker,
    Input,
    Modal,
    notification,
    Popconfirm,
    Select
} from "antd"
import {
    useEffect,
    useState
} from "react"
import dayjs from "dayjs"
import {
    updateProfileAPI
} from "../../services/user.service"
import { isValid, validateField, validateMultipleFields } from "../../utils/validate"



const UpdateUserModal = (props) => {
    const [id, setId] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [fullName, setFullName] = useState("")
    const [address, setAddress] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [accountStatus, setAccountStatus] = useState("")

    const [errors, setErrors] = useState({})

    const { isUpdateModalOpen, setIsUpdateModalOpen, dataUpdate,
        setDataUpdate, loadAccounts } = props


    useEffect(() => {
        if (dataUpdate) {
            setId(dataUpdate.id)
            setUsername(dataUpdate.username)
            setEmail(dataUpdate.email)
            setFullName(dataUpdate.fullName)
            setAddress(dataUpdate.address)
            setPhoneNumber(dataUpdate.phoneNumber)
            setDateOfBirth(dataUpdate.dateOfBirth)
            setAccountStatus(dataUpdate.accountStatus)
            setErrors({})
        }
    }, [dataUpdate])


    const handleUpdate = async () => {
        const values = {
            id,
            username,
            email,
            fullName,
            address,
            phoneNumber,
            dateOfBirth,
            accountStatus
        }
        // Các trường cần validate
        const fieldsToValidate = [
            "username",
            "email",
            "fullName",
            "phoneNumber",
            "dateOfBirth"
        ];

        const newErrors = validateMultipleFields(fieldsToValidate, values)
        setErrors(newErrors)

        if (!isValid(newErrors)) {
            notification.error({
                message: "Lỗi nhập liệu",
                description: "Vui lòng kiểm tra lại các trường thông tin.",
            });
            return;
        }

        const response = await updateProfileAPI(values)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Cập nhật thành công'
            })
        }
        resetAndClose()
        await loadAccounts()
    }


    const resetAndClose = () => {
        setIsUpdateModalOpen(false)
        setUsername('')
        setEmail('')
        setDataUpdate({})
        setErrors({})
    }


    // Có thể thêm validate realtime từng trường nếu muốn (không bắt buộc)
    const handleChangeField = (field, value) => {
        switch (field) {
            case "username":
                setUsername(value)
                setErrors(prev => ({
                    ...prev,
                    username: validateField("username", value)
                }))
                break
            case "email":
                setEmail(value)
                setErrors(prev => ({
                    ...prev,
                    email: validateField("email", value)
                }))
                break
            case "fullName":
                setFullName(value)
                setErrors(prev => ({
                    ...prev,
                    fullName: validateField("fullName", value)
                }))
                break
            case "phoneNumber":
                setPhoneNumber(value)
                setErrors(prev => ({
                    ...prev,
                    phoneNumber: validateField("phoneNumber", value)
                }))
                break
            case "dateOfBirth":
                setDateOfBirth(value)
                setErrors(prev => ({
                    ...prev,
                    dateOfBirth: validateField("dateOfBirth", value)
                }))
                break
            default:
                break
        }
    }

    return (
        <Modal
            title="Cập nhật tài khoản"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isUpdateModalOpen}
            onCancel={resetAndClose}
            footer={[
                <Button key="cancel" onClick={resetAndClose}>
                    Hủy
                </Button>,
                <Popconfirm
                    key="confirm"
                    title="Xác nhận cập nhật?"
                    description="Bạn có chắc chắn muốn cập nhật thông tin tài khoản này?"
                    onConfirm={handleUpdate}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button type="primary">Cập nhật</Button>
                </Popconfirm>
            ]}
        >
            <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                <div>
                    <span>Tên đăng nhập</span>
                    <Input
                        value={username}
                        onChange={e => handleChangeField("username", e.target.value)}
                    />
                    {errors.username && <div style={{ color: "red", fontSize: 13 }}>{errors.username}</div>}
                </div>
                <div>
                    <span>Email</span>
                    <Input
                        value={email}
                        onChange={e => handleChangeField("email", e.target.value)}
                    />
                    {errors.email && <div style={{ color: "red", fontSize: 13 }}>{errors.email}</div>}
                </div>
                <div>
                    <span>Họ và tên</span>
                    <Input
                        value={fullName}
                        onChange={e => handleChangeField("fullName", e.target.value)}
                    />
                    {errors.fullName && <div style={{ color: "red", fontSize: 13 }}>{errors.fullName}</div>}
                </div>
                <div>
                    <span>Trạng thái</span>
                    <Select value={accountStatus} onChange={setAccountStatus} style={{ width: '100%' }}>
                        <Select.Option value="Đang hoạt động">Đang hoạt động</Select.Option>
                        <Select.Option value="Tạm khóa">Tạm khóa</Select.Option>
                    </Select>
                </div>
                <div>
                    <span>Số điện thoại</span>
                    <Input
                        value={phoneNumber}
                        onChange={e => handleChangeField("phoneNumber", e.target.value)}
                    />
                    {errors.phoneNumber && <div style={{ color: "red", fontSize: 13 }}>{errors.phoneNumber}</div>}
                </div>
                <div>
                    <span>Địa chỉ</span>
                    <Input value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div>
                    <span>Ngày sinh</span>
                    <DatePicker
                        value={dateOfBirth ? dayjs(dateOfBirth) : null}
                        onChange={date => handleChangeField("dateOfBirth", date ? date.format('YYYY-MM-DD') : null)}
                        style={{ width: '100%' }}
                    />
                    {errors.dateOfBirth && <div style={{ color: "red", fontSize: 13 }}>{errors.dateOfBirth}</div>}
                </div>
            </div>
        </Modal>
    )
}
export default UpdateUserModal
