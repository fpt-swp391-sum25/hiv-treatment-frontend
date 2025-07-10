import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  fetchHealthRecordByScheduleIdAPI,
  fetchTestResultByHealthRecordIdAPI,
  updateHealthRecordAPI,
  updateTestResultAPI,
} from "../../services/api.service.js";
import {
  Typography, Space, notification, Button, Input, Card,
  Form, Row, Col, Divider, Select
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import UpdateTestResultModal from '../../components/lab-technician/UpdateTestResultModal.jsx';
import dayjs from 'dayjs';
import { createNotification } from "../../services/notification.service";


const PatientDetail = () => {
  const [dataUpdate, setDataUpdate] = useState({});
  const [healthRecordData, setHealthRecordData] = useState({});
  const [testResultData, setTestResultData] = useState([]);
  const [isUpdateTestResultModalOpen, setIsUpdateTestResultModalOpen] = useState(false);

  const { id } = useParams();
  const { Title } = Typography;
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setHealthRecordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateHealthRecord = async () => {
    try {
      const updatePayload = {
        id: healthRecordData.id,
        hivStatus: healthRecordData.hivStatus,
        bloodType: healthRecordData.bloodType,
        weight: healthRecordData.weight,
        height: healthRecordData.height,
        treatmentStatus: healthRecordData.treatmentStatus,
        scheduleId: healthRecordData.schedule?.id,
        regimenId: healthRecordData.regimen?.id,
      };

      const response = await updateHealthRecordAPI(healthRecordData.id, updatePayload);

      for (const test of testResultData) {
        await updateTestResultAPI(
          test.id,
          test.type,
          test.result,
          test.unit,
          test.note,
          test.expectedResultTime,
          test.actualResultTime
        );
      }

      if (response.data) {
        notification.success({
          message: 'Hệ thống',
          showProgress: true,
          pauseOnHover: true,
          description: 'Cập nhật thông tin sức khỏe thành công!'
        });

        // Kiểm tra đã điền đầy đủ kết quả xét nghiệm chưa
        const allResultsFilled = testResultData.every(
          (test) => test.result !== null && test.result !== ''
        );

        // Nếu hợp lệ thì gửi thông báo cho bác sĩ và bệnh nhân
        if (
          (healthRecordData.hivStatus === "Dương tính" || healthRecordData.hivStatus === "Âm tính") &&
          allResultsFilled
        ) {
          const doctorId = healthRecordData.schedule?.doctor?.id;
          const patient = healthRecordData.schedule?.patient;
        
          if (doctorId && patient?.id && patient?.fullName) {
            const createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');
        
            // Gửi cho bác sĩ
            await createNotification({
              title: "Thông báo kết quả xét nghiệm",
              message: `Đã có kết quả xét nghiệm của bệnh nhân ${patient.fullName}`,
              createdAt,
              userId: doctorId,
            });
        
            // Gửi cho bệnh nhân
            await createNotification({
              title: "Kết quả xét nghiệm đã sẵn sàng",
              message: "Bạn có thể xem kết quả xét nghiệm mới trong hồ sơ sức khỏe.",
              createdAt,
              userId: patient.id,
            });
          }
        }
        

        await loadData();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại.");
    }
  };

  return (
    <div style={{ margin: '0 10vw' }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button onClick={() => navigate(-1)}>← Quay lại</Button>
        <Title level={3} style={{ textAlign: "center", width: "100%" }}>
          Chi tiết ca khám
        </Title>
      </Space>

      <Card title="Thông tin sức khỏe" style={{ marginTop: '5vh' }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nhóm máu">
                <Input name="bloodType" value={healthRecordData.bloodType || ''} onChange={handleInputChange} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái HIV">
                <Select
                  value={healthRecordData.hivStatus || ''}
                  onChange={(value) => setHealthRecordData((prev) => ({ ...prev, hivStatus: value }))}
                  placeholder="Chọn trạng thái"
                >
                  <Select.Option value="Dương tính">Dương tính</Select.Option>
                  <Select.Option value="Âm tính">Âm tính</Select.Option>
                  <Select.Option value="Chưa xác định">Chưa xác định</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" onClick={handleUpdateHealthRecord}>Cập nhật hồ sơ bệnh nhân</Button>
        </Form>
      </Card>

      <Divider orientation="center" style={{ marginTop: '10vh' }}>Kết quả xét nghiệm</Divider>

      {testResultData.map((test) => (
        <Card key={test.id} style={{ marginTop: 16 }}>
          <Row gutter="5vw">
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
              <p><strong>Thời gian dự kiến:</strong> {formatDate(test.expectedResultTime)}</p>
            </Col>
            <Col span={8}>
              <p><strong>Thời gian nhận kết quả:</strong> {formatDate(test.actualResultTime)}</p>
            </Col>
            <Col span={8}>
              <Space>
                <EditOutlined
                  style={{ color: 'orange', cursor: 'pointer' }}
                  onClick={() => {
                    setDataUpdate(test);
                    setIsUpdateTestResultModalOpen(true);
                  }}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      ))}

      <UpdateTestResultModal
        isUpdateTestResultModalOpen={isUpdateTestResultModalOpen}
        setIsUpdateTestResultModalOpen={setIsUpdateTestResultModalOpen}
        dataUpdate={dataUpdate}
        onPreviewUpdate={(updatedTest) => {
          setTestResultData((prev) =>
            prev.map((test) => test.id === updatedTest.id ? updatedTest : test)
          );
        }}
      />
    </div>
  );
};

// Format datetime
const formatDate = (value) => {
  return value && !isNaN(new Date(value))
    ? new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
      }).format(new Date(value))
    : '';
};

export default PatientDetail;