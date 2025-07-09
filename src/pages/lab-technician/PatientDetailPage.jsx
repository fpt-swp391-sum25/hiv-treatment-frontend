import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  fetchHealthRecordByScheduleIdAPI,
  fetchTestResultByHealthRecordIdAPI,
  updateHealthRecordAPI,
  deleteTestResultAPI,
  createTestResultAPI
} from "../../services/api.service.js";
import { Typography, Space, notification, Popconfirm,
  Button, Input, Modal, DatePicker, Card, Form, Row, Col, Divider, Select
} from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import UpdateTestResultModal from '../../components/lab-technician/UpdateTestResultModal.jsx';
import dayjs from 'dayjs';
import { createNotification } from "../../services/notification.service";

const PatientDetail = () => {
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [expectedResultTime, setExpectedResultTime] = useState("");
  const [dataUpdate, setDataUpdate] = useState({})
  const [healthRecordData, setHealthRecordData] = useState({});
  const [testResultData, setTestResultData] = useState([]);
  const [isCreateTestResultModalOpen, setIsCreateTestResultModalOpen] = useState(false)
  const [isUpdateTestResultModalOpen, setIsUpdateTestResultModalOpen] = useState(false)

  const { id } = useParams();
  const { TextArea } = Input;
  const { Title } = Typography;
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [dataUpdate]);

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
      // Gửi đủ các trường như backend yêu cầu
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
      if (response.data) {
        notification.success({
          message: 'Hệ thống',
          showProgress: true,
          pauseOnHover: true,
          description: 'Cập nhật thông tin sức khỏe thành công!'
        });
        // Thêm log để kiểm tra dữ liệu healthRecordData
        console.log("DEBUG | healthRecordData:", healthRecordData);
        // Tạo notification cho bác sĩ nếu trạng thái HIV hợp lệ
        if (
          healthRecordData.hivStatus === "Dương tính" ||
          healthRecordData.hivStatus === "Âm tính"
        ) {
          const doctorId = healthRecordData.schedule?.doctor?.id;
          const patientName = healthRecordData.schedule?.patient?.fullName;
          console.log("DEBUG | doctorId:", doctorId, "patientName:", patientName);
          if (doctorId && patientName) {
            try {
              await createNotification({
                title: "thông báo kết quả",
                message: `đã có kết quả xét nghiệm của bệnh nhân ${patientName}`,
                createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
                userId: doctorId,
              });
              console.log("Notification sent!");
            } catch (err) {
              console.error("Notification error:", err);
            }
          } else {
            console.warn("Không tìm thấy doctorId hoặc patientName để gửi notification");
          }
        }
        await loadData();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại.");
    }
  };

  const handleCreateTestResult = async () => {
    try {
      const response = await createTestResultAPI(type, note, expectedResultTime, healthRecordData.id);
      if (response.data) {
        notification.success({
          message: 'Hệ thống',
          showProgress: true,
          pauseOnHover: true,
          description: 'Tạo kết quả xét nghiệm thành công'
        });
      }
      resetAndClose();
      await loadData();
    } catch (error) {
      console.error("Lỗi tạo kết quả:", error.response?.data || error.message);
      notification.error({
        message: 'Lỗi',
        showProgress: true,
        pauseOnHover: true,
        description: 'Không thể tạo kết quả xét nghiệm'
      });
    }
  };

  const handleDeleteTestResult = async (testResultId) => {
    const response = await deleteTestResultAPI(testResultId)
    if (response.data) {
      notification.success({
        message: 'Hệ thống',
        showProgress: true,
        pauseOnHover: true,
        description: 'Xóa kết quả xét nghiệm thành công'
      })
      await loadData()
    }
  }

  const resetAndClose = () => {
    setIsCreateTestResultModalOpen(false)
    setType('')
    setNote('')
    setExpectedResultTime('')
  }

  return (
    <div style={{ marginRight: 10 + 'vw', marginLeft: 10 + 'vw' }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button onClick={() => navigate(-1)}>← Quay lại</Button>
        <Title level={3} style={{ textAlign: "center", width: "100%" }}>
          Chi tiết ca khám
        </Title>
      </Space>

      <Card title="Thông tin sức khỏe" style={{ marginTop: 5 + 'vh' }}>
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
                  onChange={(value) =>
                    setHealthRecordData((prev) => ({ ...prev, hivStatus: value }))
                  }
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

      <Divider orientation="center" style={{ marginTop: 10 + 'vh' }}>Kết quả xét nghiệm</Divider>

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
              <p>
                <strong>Thời gian dự kiến:</strong>{" "}
                {test.expectedResultTime && !isNaN(new Date(test.expectedResultTime))
                  ? new Intl.DateTimeFormat('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour12: false,
                  }).format(new Date(test.expectedResultTime))
                  : ''
                }
              </p>
            </Col>

            <Col span={8}>
              <p>
                <strong>Thời gian nhận kết quả:</strong>{" "}
                {test.actualResultTime && !isNaN(new Date(test.actualResultTime))
                  ? new Intl.DateTimeFormat('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour12: false,
                  }).format(new Date(test.actualResultTime))
                  : ''
                }
              </p>
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
    </div>
  );
};

export default PatientDetail;