import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  fetchHealthRecordByScheduleIdAPI,
  fetchTestResultByHealthRecordIdAPI,
  updateHealthRecordAPI
} from "../../services/api.service";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [healthRecordData, setHealthRecordData] = useState({});
  const [testResultData, setTestResultData] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const healthRecord = (await fetchHealthRecordByScheduleIdAPI(id)).data;
      if (healthRecord) {
        setHealthRecordData(healthRecord);
        const testResultRes = await fetchTestResultByHealthRecordIdAPI(healthRecord.id);
        setTestResultData(testResultRes.data || []);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHealthRecordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await updateHealthRecordAPI(healthRecordData.id, healthRecordData);
      alert("Cập nhật thông tin sức khỏe thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại.");
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Quay lại</button>

      <h2>Chi tiết ca khám với ID: {id}</h2>

      <h3>Thông tin sức khỏe</h3>
      <div>
        <label>Mã phòng khám:</label>
        <input
          name="roomCode"
          value={healthRecordData.roomCode || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Số bảo hiểm y tế: {healthRecordData.insuranceNumber || ''}</label>
      </div>

      <div>
        <label>Chiều cao:</label>
        <input
          name="height"
          value={healthRecordData.height || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Cân nặng:</label>
        <input
          name="weight"
          value={healthRecordData.weight || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Nhóm máu:</label>
        <input
          name="bloodType"
          value={healthRecordData.bloodType || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Trạng thái HIV:</label>
        <input
          name="hivStatus"
          value={healthRecordData.hivStatus || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Trạng thái điều trị:</label>
        <input
          name="treatmentStatus"
          value={healthRecordData.treatmentStatus || ''}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label>Ghi chú:</label>
        <textarea
          name="note"
          value={healthRecordData.note || ''}
          onChange={handleInputChange}
        />
      </div>

      <button onClick={handleUpdate}> Cập nhật</button>

      <h3>Kết quả xét nghiệm</h3>
      {testResultData.map((test) => (
        <div key={test.id} style={{ marginBottom: '16px' }}>
          <p><strong>Loại xét nghiệm:</strong> {test.type}</p>
          <p><strong>Kết quả:</strong> {test.result} {test.unit}</p>
          <p><strong>Ghi chú:</strong> {test.note}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default PatientDetail;
