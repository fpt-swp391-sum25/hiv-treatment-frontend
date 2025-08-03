import { Input, Modal, DatePicker, Select, message } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getAllTestTypes } from "../../services/testtype.service";

const UpdateTestOrderModal = (props) => {
  const {
    isUpdateTestOrderModalOpen,
    setIsUpdateTestOrderModalOpen,
    dataUpdate,
    onPreviewUpdate,
  } = props;

  const [id, setId] = useState("");
  const [type, setType] = useState({});
  const [typeId, setTypeId] = useState('')
  const [result, setResult] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [expectedResultTime, setExpectedResultTime] = useState(null);
  const [actualResultTime, setActualResultTime] = useState(null);

  const [testTypes, setTestTypes] = useState([]);

  // Gọi API khi mở modal
  useEffect(() => {
    if (isUpdateTestOrderModalOpen) {
      fetchTestTypes();
    }
  }, [isUpdateTestOrderModalOpen]);

  const fetchTestTypes = async () => {
    try {
      const data = await getAllTestTypes();
      setTestTypes(data);
    } catch (error) {
      message.error("Không thể tải danh sách loại xét nghiệm");
      console.error(error);
    }
  };

  useEffect(() => {
    if (dataUpdate) {
      setId(dataUpdate.id ?? "");
      setType(dataUpdate.type ?? null);
      setTypeId(dataUpdate.type?.id ?? "");
      setResult(dataUpdate.result ?? "");
      setUnit(dataUpdate.unit ?? "");
      setNote(dataUpdate.note ?? "");
      setExpectedResultTime(
        dataUpdate.expectedResultTime
          ? dayjs(dataUpdate.expectedResultTime)
          : null
      );
      setActualResultTime(
        dataUpdate.actualResultTime
          ? dayjs(dataUpdate.actualResultTime)
          : null
      );
    }
  }, [dataUpdate]);

  const handleTypeChange = (value) => {
    setType(testTypes.find(item => item.id === value))
    setTypeId(value);
  };

  const handleUpdate = () => {
    const updatedData = {
      id,
      testTypeId: typeId,
      type: testTypes.find(item => item.id === typeId),
      result,
      unit,
      note,
      expectedResultTime: expectedResultTime
        ? expectedResultTime.toISOString()
        : null,
      actualResultTime: actualResultTime
        ? actualResultTime.toISOString()
        : null,
    };

    if (typeof onPreviewUpdate === "function") {
      onPreviewUpdate(updatedData);
    }

    resetAndClose();
  };

  const resetAndClose = () => {
    setIsUpdateTestOrderModalOpen(false);
  };

  return (
    <Modal
      title="Cập nhật kết quả xét nghiệm"
      open={isUpdateTestOrderModalOpen}
      onOk={handleUpdate}
      onCancel={resetAndClose}
      okText={"Xác nhận"}
      cancelText={"Hủy"}
    >
      <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
        <span>Loại xét nghiệm</span>
        <Select
          showSearch
          style={{ width: "100%" }}
          value={type?.id}
          onChange={handleTypeChange}
          options={testTypes.map((item) => ({
            label: item.testTypeName,
            value: item.id,
          }))}
          placeholder="Chọn loại xét nghiệm"
          optionFilterProp="label"
        />

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

export default UpdateTestOrderModal;
