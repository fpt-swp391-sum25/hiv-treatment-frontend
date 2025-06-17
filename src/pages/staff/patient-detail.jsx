import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  fetchHealthRecordByScheduleIdAPI,
  fetchTestResultByHealthRecordIdAPI,
<<<<<<< HEAD
  updateHealthRecordAPI,
  deleteTestResultAPI,
  createTestResultAPI
} from "../../services/api.service";
import { Typography, Space, notification, Popconfirm, 
        Button, Input, Modal, DatePicker, Card, Form, Row, Col, Divider } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import UpdateTestResultModal from "./update-test-result-modal";

const PatientDetail = () => {
  const [type, setType] = useState("");
  const [result, setResult] = useState("");
  const [unit, setUnit] = useState("");
  const [note, setNote] = useState("");
  const [expectedResultTime, setExpectedResultTime] = useState("");
  const [actualResultTime, setActualResultTime] = useState("");
  const [dataUpdate, setDataUpdate] = useState({})
  const [healthRecordData, setHealthRecordData] = useState({});
  const [testResultData, setTestResultData] = useState([]);
  const [isCreateTestResultModalOpen, setIsCreateTestResultModalOpen] = useState(false)
  const [isUpdateTestResultModalOpen, setIsUpdateTestResultModalOpen] = useState(false)

  const { id } = useParams();
  const { TextArea } = Input;
  const { Title } = Typography;
  const navigate = useNavigate();
=======
  updateHealthRecordAPI
} from "../../services/api.service";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [healthRecordData, setHealthRecordData] = useState({});
  const [testResultData, setTestResultData] = useState([]);
>>>>>>> 01a32a036ebce419dcf4e532761457025799d41a

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

<<<<<<< HEAD
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setHealthRecordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateHealthRecord = async () => {
=======
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHealthRecordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
>>>>>>> 01a32a036ebce419dcf4e532761457025799d41a
    try {
      await updateHealthRecordAPI(healthRecordData.id, healthRecordData);
      alert("Cập nhật thông tin sức khỏe thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại.");
    }
  };

<<<<<<< HEAD
  const handleCreateTestResult = async () => {
    try {
      const response = await createTestResultAPI(type, note, expectedResultTime, healthRecordData.id);
      if (response.data) {
        notification.success({
          message: 'Hệ thống',
          description: 'Tạo kết quả xét nghiệm thành công'
        });
      }
      resetAndClose();
      await loadData();
    } catch (error) {
      console.error("Lỗi tạo kết quả:", error.response?.data || error.message);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tạo kết quả xét nghiệm'
      });
    }
  };

  const handleDeleteTestResult = async (testResultId) => {
    const response = await deleteTestResultAPI(testResultId)
        if (response.data) {
            notification.success({
                message: 'Hệ thống',
                description: 'Xóa kết quả xét nghiệm thành công'
            })
            await loadData()
        }
  }

  const resetAndClose = () => {
        setIsCreateTestResultModalOpen(false)
        setType('')
        setResult('')
        setUnit('')
        setNote('')
        setExpectedResultTime('')
  }

  return (
    <div style = {{marginRight: 10 + 'vw', marginLeft: 10 + 'vw'}}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button onClick={() => navigate(-1)}>← Quay lại</Button>
        <Title level={3} style={{ textAlign: "center", width: "100%" }}>
          Chi tiết ca khám
        </Title>
      </Space>

      <Card title="Thông tin sức khỏe" style={{ marginTop: 5 + 'vh'}}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Mã phòng khám">
                <Input name="roomCode" value={healthRecordData.roomCode || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số bảo hiểm y tế">
                <Input name="insuranceNumber" value={healthRecordData.insuranceNumber || ''} readOnly />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Chiều cao">
                <Input name="height" value={healthRecordData.height || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cân nặng">
                <Input name="weight" value={healthRecordData.weight || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nhóm máu">
                <Input name="bloodType" value={healthRecordData.bloodType || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái HIV">
                <Input name="hivStatus" value={healthRecordData.hivStatus || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái điều trị">
                <Input name="treatmentStatus" value={healthRecordData.treatmentStatus || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ghi chú">
                <TextArea name="note" value={healthRecordData.note || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" onClick={handleUpdateHealthRecord}>Cập nhật hồ sơ bệnh nhân</Button>
        </Form>
      </Card>

      <Divider orientation="center" style = {{marginTop: 10 + 'vh'}}>Kết quả xét nghiệm</Divider>

      <Button type="primary" onClick={() => setIsCreateTestResultModalOpen(true)}>Tạo mới</Button>

      <Modal
          title="Tạo kết quả xét nghiệm"
          closable={{ 'aria-label': 'Custom Close Button' }}
          open={isCreateTestResultModalOpen}
          onOk={handleCreateTestResult}
          onCancel={resetAndClose}
          okText={"Tạo"}
          cancelText={"Hủy"}
      >
          <Form layout="vertical">
            <Form.Item label="Loại xét nghiệm">
              <Input value={type} onChange={(event) => setType(event.target.value)} />
            </Form.Item>
            <Form.Item label="Ghi chú">
              <Input value={note} onChange={(event) => setNote(event.target.value)} />
            </Form.Item>
            <Form.Item label="Thời gian dự kiến">
              <DatePicker
                format="DD/MM/YYYY"
                onChange={(value) => setExpectedResultTime(value?.format("YYYY-MM-DD"))}
              />
            </Form.Item>
          </Form>
      </Modal>

      {testResultData.map((test) => (
        <Card key={test.id} style={{ marginTop: 16 }}>
          <Row gutter={5 + "vw"}>
            <Col span={8}>
              <p><strong>Loại:</strong> {test.type}</p>
            </Col>
            
            <Col span={8}>
              <p><strong>Kết quả:</strong> {test.result} {test.unit}</p>
            </Col>
            <Col span={8}>
              <p><strong>Ghi chú:</strong> {test.note}</p>
            </Col>
            <Col span={8}>
             <p><strong>Thời gian dự kiến:</strong> {new Date(test.expectedResultTime).toLocaleDateString('vi-VN')}</p>
            </Col>
            <Col span={8}>
              <p><strong>Thời gian nhận kết quả:</strong> {new Date(test.actualResultTime).toLocaleString('vi-VN')}</p>
            </Col>

            <Col span={8}>
              <Space>
                <EditOutlined
                  style={{ color: 'orange', cursor: 'pointer' }}
                  onClick={() => {
                    setIsUpdateTestResultModalOpen(true);
                    setDataUpdate(test);
                  }}
                />
                <Popconfirm
                  title="Xoá kết quả?"
                  onConfirm={() => handleDeleteTestResult(test.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
                </Popconfirm>
              </Space>
            </Col>
          </Row>
        </Card>
      ))}

      <UpdateTestResultModal
        isUpdateTestResultModalOpen={isUpdateTestResultModalOpen}
        setIsUpdateTestResultModalOpen={setIsUpdateTestResultModalOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadData={loadData}
      />  
=======
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
>>>>>>> 01a32a036ebce419dcf4e532761457025799d41a
    </div>
  );
};

export default PatientDetail;
