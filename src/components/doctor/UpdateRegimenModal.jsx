import {
    useEffect,
    useState
} from "react"
import {
    Form,
    Input,
    Modal,
    notification
} from "antd"
import {
    updateRegimenAPI
} from "../../services/regimen.service"
const UpdateRegimenModal = (props) => {
    const [id, setId] = useState("")
    const [components, setComponents] = useState('')
    const [regimenName, setReginmenName] = useState('')
    const [description, setDescription] = useState('')
    const [indications, setIndications] = useState('')
    const [contraindications, setContradications] = useState('')

    const {
        dataUpdate,
        setDataUpdate,
        isUpdateRegimenModalOpen,
        setIsUpdateRegimenModalOpen,
        loadRegimens
    } = props

    useEffect(() => {
        if (dataUpdate) {
            setId(dataUpdate.id)
            setComponents(dataUpdate.components)
            setReginmenName(dataUpdate.regimenName)
            setDescription(dataUpdate.description)
            setIndications(dataUpdate.indications)
            setContradications(dataUpdate.contraindications)
        }
    }, [dataUpdate])

    const handleUpdateRegimen = async () => {
        const response = await updateRegimenAPI(id, components, regimenName,
            description, indications, contraindications)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Cập nhật phác đồ thành công'
            })
        } else {
            notification.error({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Cập nhật phác đồ thất bại'
            })
        }
        resetAndClose()
        await loadRegimens()
    }

    const resetAndClose = () => {
        setIsUpdateRegimenModalOpen(false)
        setReginmenName('')
        setComponents('')
        setDescription('')
        setIndications('')
        setContradications('')
        setDataUpdate({})
    }

    return (
        <Modal
            title="Chỉnh sửa phác đồ điều trị"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isUpdateRegimenModalOpen}
            onOk={handleUpdateRegimen}
            onCancel={resetAndClose}
            okText={"Cập nhật"}
            cancelText={"Hủy"}
        >
            <Form>
                <Form.Item label='Tên phác đồ'>
                    <Input value={regimenName} onChange={(event) => setReginmenName(event.target.value)} />
                </Form.Item>
                <Form.Item label='Thành phần phác đồ'>
                    <Input value={components} onChange={(event) => setComponents(event.target.value)} />
                </Form.Item>
                <Form.Item label='Mô tả'>
                    <Input value={description} onChange={(event) => setDescription(event.target.value)} />
                </Form.Item>
                <Form.Item label='Chỉ định'>
                    <Input value={indications} onChange={(event) => setIndications(event.target.value)} />
                </Form.Item>
                <Form.Item label='Chống chỉ định'>
                    <Input value={contraindications} onChange={(event) => setContradications(event.target.value)} />
                </Form.Item>
            </Form>
        </Modal>
    )
}
export default UpdateRegimenModal;