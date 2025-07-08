import { Input, Modal, notification, DatePicker } from "antd"
import { useEffect, useState } from "react"
import { updateTestResultAPI } from "../../services/api.service"
import dayjs from "dayjs"

const UpdateTestResultModal = (props) => {
    const [id, setId] = useState("")
    const [type, setType] = useState("");
    const [result, setResult] = useState("");
    const [unit, setUnit] = useState("");
    const [note, setNote] = useState("");
    const [expectedResultTime, setExpectedResultTime] = useState(null);
    const [actualResultTime, setActualResultTime] = useState(null);

    const { isUpdateTestResultModalOpen, setIsUpdateTestResultModalOpen, dataUpdate, setDataUpdate } = props

    useEffect(() => {
        if (dataUpdate) {
            setId(dataUpdate.id ?? "")
            setType(dataUpdate.type ?? "")
            setResult(dataUpdate.result ?? "")
            setUnit(dataUpdate.unit ?? "")
            setNote(dataUpdate.note ?? "")
            setExpectedResultTime(dataUpdate.expectedResultTime ?? "")
            setActualResultTime(dataUpdate.actualResultTime ?? "")

        }
    }, [dataUpdate])

    const handleUpdate = async () => {
        const response = await updateTestResultAPI(id, type, result, unit, note, expectedResultTime, actualResultTime)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                showProgress: true,
                pauseOnHover: true,
                description: 'Cập nhật thành công'
            })
        }
        resetAndClose()
    }

    const resetAndClose = () => {
        setIsUpdateTestResultModalOpen(false)
        setType("")
        setResult("")
        setUnit("")
        setNote("")
        setExpectedResultTime("")
        setActualResultTime("")
        setDataUpdate("")
    }

    return (
        <Modal
            title="Cập nhật kết quả xét nghiệm"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isUpdateTestResultModalOpen}
            onOk={handleUpdate}
            onCancel={resetAndClose}
            okText={"Cập nhật"}
            cancelText={"Hủy"}>

            <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
                <span>Loại xét nghiệm</span>
                <Input readOnly value={type} onChange={(event) => { setType(event.target.value) }} />
                <span>Kết quả</span>
                <Input value={result} onChange={(event) => { setResult(event.target.value) }} />
                <span>Đơn vị</span>
                <Input value={unit} onChange={(event) => { setUnit(event.target.value) }} />
                <span>Ghi chú</span>
                <Input value={note} onChange={(event) => { setNote(event.target.value) }} />
                <span>Thời gian dự kiến</span>
                <DatePicker
                    format="HH:mm DD/MM/YYYY"
                    showTime
                    value={expectedResultTime ? dayjs(expectedResultTime) : ''}
                    onChange={(value) => setExpectedResultTime(dayjs(value).format("YYYY-MM-DDTHH:mm:ss"))}
                />
                <span>Thời gian nhận kết quả</span>
                <DatePicker
                    format="HH:mm DD/MM/YYYY"
                    showTime
                    value={actualResultTime ? dayjs(actualResultTime) : ''}
                    onChange={(value) => setActualResultTime(dayjs(value).format("YYYY-MM-DDTHH:mm:ss"))}
                />
            </div>
        </Modal>
    )
}

export default UpdateTestResultModal