import { Input, Modal, notification } from "antd"
import { useEffect, useState } from "react"
import { updateAccountAPI } from "../../services/api.service"



const UpdateUserModal = (props) => {
    const [id, setId] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [role, setRole] = useState("")

    const { isUpdateModalOpen, setIsUpdateModalOpen, dataUpdate, setDataUpdate, loadAccounts } = props

    useEffect(() => {
        if (dataUpdate) {
            setId(dataUpdate.id)
            setUsername(dataUpdate.username)
            setEmail(dataUpdate.email)
            setRole(dataUpdate.role)
        }
    }, [dataUpdate])

    const handleUpdate = async () => {
        const response = await updateAccountAPI(id, username, email)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
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
            title="Tạo tài khoản cho quản lí"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isUpdateModalOpen}
            onOk={handleUpdate}
            onCancel={resetAndClose}
            okText={"Cập nhật"}
            cancelText={"Hủy"}
        >
            <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                <div>
                    <span>Tên đăng nhập</span>
                    <Input value={username} onChange={(event) => { setUsername(event.target.value) }} />
                </div>
                <div>
                    <span>Email</span>
                    <Input value={email} onChange={(event) => { setEmail(event.target.value) }} />
                </div>
                <div>
                    <span>Vai trò</span>
                    <Input disabled value={role} />
                </div>
            </div>
        </Modal>
    )
}

export default UpdateUserModal