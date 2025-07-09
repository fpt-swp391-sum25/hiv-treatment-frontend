import { Button, DatePicker, Input, Modal, notification, Popconfirm, Select } from "antd"
import { useEffect, useState } from "react"
import { updateAccountAPI, updateProfileAPI } from "../../services/api.service"
import dayjs from "dayjs"

const UpdateUserModal = (props) => {
    const [id, setId] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [fullName, setFullName] = useState("")
    const [address, setAddress] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [accountStatus, setAccountStatus] = useState("")
    const [role, setRole] = useState("")

    const { isUpdateModalOpen, setIsUpdateModalOpen, dataUpdate,
        setDataUpdate, loadAccounts } = props

    useEffect(() => {
        if (dataUpdate) {
            setId(dataUpdate.id)
            setUsername(dataUpdate.username)
            setEmail(dataUpdate.email)
            setRole(dataUpdate.role)
            setFullName(dataUpdate.fullName)
            setAddress(dataUpdate.address)
            setPhoneNumber(dataUpdate.phoneNumber)
            setDateOfBirth(dataUpdate.dateOfBirth)
            setAccountStatus(dataUpdate.accountStatus)
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
        setRole('')
        setDataUpdate({})
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
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <span>Email</span>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <span>Họ và tên</span>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                    <span>Trạng thái</span>
                    <Select value={accountStatus} onChange={(value) => setAccountStatus(value)} style={{ width: '100%' }}>
                        <Select.Option value="Đang hoạt động">Đang hoạt động</Select.Option>
                        <Select.Option value="Tạm khóa">Tạm khóa</Select.Option>
                    </Select>
                </div>
                <div>
                    <span>Số điện thoại</span>
                    <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                <div>
                    <span>Địa chỉ</span>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>

                <div>
                    <span>Ngày sinh</span>
                    <DatePicker
                        value={dateOfBirth ? dayjs(dateOfBirth) : null}
                        onChange={(date) => setDateOfBirth(date ? date.format('YYYY-MM-DD') : null)}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </Modal>
    )
}

export default UpdateUserModal