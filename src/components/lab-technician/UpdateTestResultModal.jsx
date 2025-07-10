import { Input, Modal, DatePicker } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const UpdateTestResultModal = (props) => {
  const {
    isUpdateTestResultModalOpen,
    setIsUpdateTestResultModalOpen,
    dataUpdate,
    onPreviewUpdate,
  } = props;

  const [id, setId] = useState("");
  const [type, setType] = useState("");
  const [result, setResult] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [expectedResultTime, setExpectedResultTime] = useState(null);
  const [actualResultTime, setActualResultTime] = useState(null);

  useEffect(() => {
    if (dataUpdate) {
      setId(dataUpdate.id ?? "");
      setType(dataUpdate.type ?? "");
      setResult(dataUpdate.result ?? "");
      setUnit(dataUpdate.unit ?? "");
      setNote(dataUpdate.note ?? "");
      setExpectedResultTime(dataUpdate.expectedResultTime ? dayjs(dataUpdate.expectedResultTime) : null);
      setActualResultTime(dataUpdate.actualResultTime ? dayjs(dataUpdate.actualResultTime) : null);
    }
  }, [dataUpdate]);

  const handleUpdate = () => {
    const updatedData = {
      id,
      type,
      result,
      unit,
      note,
      expectedResultTime: expectedResultTime ? expectedResultTime.toISOString() : null,
      actualResultTime: actualResultTime ? actualResultTime.toISOString() : null,
    };

    if (typeof onPreviewUpdate === "function") {
      onPreviewUpdate(updatedData); 
    }

    resetAndClose();
  };

  const resetAndClose = () => {
    setIsUpdateTestResultModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật kết quả xét nghiệm"
      closable={{ "aria-label": "Custom Close Button" }}
      open={isUpdateTestResultModalOpen}
      onOk={handleUpdate}
      onCancel={resetAndClose}
      okText={"Xác nhận"}
      cancelText={"Hủy"}
    >
      <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
        <span>Loại xét nghiệm</span>
        <Input readOnly value={type} />

        <span>Kết quả</span>
        <Input value={result} onChange={(e) => setResult(e.target.value)} />

        <span>Đơn vị</span>
        <Input value={unit} onChange={(e) => setUnit(e.target.value)} />

        <span>Ghi chú</span>
        <Input value={note} onChange={(e) => setNote(e.target.value)} />

        <span>Thời gian dự kiến</span>
        <DatePicker
          format="HH:mm DD/MM/YYYY"
          showTime
          value={expectedResultTime}
          onChange={(value) => setExpectedResultTime(value)}
        />

        <span>Thời gian nhận kết quả</span>
        <DatePicker
          format="HH:mm DD/MM/YYYY"
          showTime
          value={actualResultTime}
          onChange={(value) => setActualResultTime(value)}
        />
      </div>
    </Modal>
  );
};

export default UpdateTestResultModal;