import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom"
import {
  useState,
  useEffect,
} from "react"
import {
  Typography,
  Space,
  notification,
  Button,
  Input,
  Card,
  Form,
  Row,
  Col,
  Divider,
  Select
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import UpdateTestOrderModal from '../../components/lab-technician/UpdateTestOrderModal.jsx';
import dayjs from 'dayjs';
import { createNotification } from "../../services/notification.service";
import { fetchHealthRecordByScheduleIdAPI, fetchTestOrderByHealthRecordIdAPI, updateHealthRecordAPI } from "../../services/health-record.service.js";
import { updateTestOrderAPI } from "../../services/testOrder.service.js";
import { getAllTestTypes } from "../../services/testtype.service.js";


const PatientDetail = () => {
  const [dataUpdate, setDataUpdate] = useState({})
  const [healthRecordData, setHealthRecordData] = useState({})
  const [testOrderData, setTestOrderData] = useState([])
  const [isUpdateTestOrderModalOpen, setIsUpdateTestOrderModalOpen] = useState(false)
  const [testTypes, setTestTypes] = useState([]);

  const location = useLocation();
  const fromTab = location.state?.fromTab;
  const { id } = useParams()
  const { Title } = Typography
  const navigate = useNavigate()

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const healthRecord = (await fetchHealthRecordByScheduleIdAPI(id)).data;
      if (healthRecord) {
        setHealthRecordData(healthRecord);
        const testOrderRes = await fetchTestOrderByHealthRecordIdAPI(healthRecord.id);
        setTestOrderData(testOrderRes.data || []);
      }

      const testTypeList = await getAllTestTypes();
      setTestTypes(testTypeList);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };


  const handleInputChange = (event) => {
    const { name, value } = event.target
    setHealthRecordData((prev) => ({ ...prev, [name]: value }))
  }

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
      }

      const response = await updateHealthRecordAPI(healthRecordData.id, updatePayload)

      for (const test of testOrderData) {
        await updateTestOrderAPI(
          test.id,
          test.type,
          test.result,
          test.unit,
          test.note,
          test.expectedResultTime,
          test.actualResultTime
        )
      }

      if (response.data) {
        notification.success({
          message: 'Hệ thống',
          showProgress: true,
          pauseOnHover: true,
          description: 'Cập nhật thông tin sức khỏe thành công!'
        })

        const allResultsFilled = testOrderData.every(
          (test) => test.result !== null && test.result !== ''
        )

        if (
          (healthRecordData.hivStatus === "Dương tính"
            || healthRecordData.hivStatus === "Âm tính"
            || healthRecordData.hivStatus === "Chưa xác định") &&
          allResultsFilled
        ) {
          const doctorId = healthRecordData.schedule?.doctor?.id;
          const patient = healthRecordData.schedule?.patient;

          if (doctorId && patient?.id && patient?.fullName) {
            const createdAt = dayjs().format('YYYY-MM-DDTHH:mm:ss');

            await createNotification({
              title: "Thông báo kết quả xét nghiệm",
              message: `Đã có kết quả xét nghiệm của bệnh nhân ${patient.fullName}`,
              createdAt,
              userId: doctorId,
            });

            await createNotification({
              title: "Kết quả xét nghiệm đã sẵn sàng",
              message: "Bạn có thể xem kết quả xét nghiệm mới trong hồ sơ sức khỏe.",
              createdAt,
              userId: patient.id,
            })
          }
        }


        await loadData()
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error)
      alert("Cập nhật thất bại.")
    }
  }

  return (
    <div style={{ margin: '0 10vw' }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button onClick={() => {
          if (fromTab) {
            navigate(`/lab-technician?tab=${fromTab}`);
          } else {
            navigate(-1);
          }
        }}>
          ← Quay lại
        </Button>
        <Title level={3} style={{ textAlign: "center", width: "100%" }}>
          Chi tiết ca khám
        </Title>
      </Space>

      <Button type="primary" onClick={handleUpdateHealthRecord}>Cập nhật hồ sơ bệnh nhân</Button>

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
        </Form>
      </Card>

      <Divider orientation="center" style={{ marginTop: '10vh' }}>Kết quả xét nghiệm</Divider>

      {testOrderData.map((test) => (
        <Card key={test.id} style={{ marginTop: 16 }}>
          <Row gutter="5vw">
            <Col span={6}>
              <p><strong>Tên:</strong> {test.name}</p>
            </Col>
            <Col span={6}>
              <p><strong>Loại:</strong> {test.type?.testTypeName}</p>
            </Col>
            <Col span={6}>
              <p><strong>Kết quả:</strong> {test.result} {test.unit}</p>
            </Col>
            <Col span={6}>
              <p><strong>Trạng thái:</strong> {test.paymentStatus}</p>
            </Col>
          </Row>

          <Row gutter="5vw">
            <Col span={6}>
              <p><strong>Ghi chú:</strong> {test.note}</p>
            </Col>
            <Col span={6}>
              <p><strong>Thời gian dự kiến:</strong> {formatDate(test.expectedResultTime)}</p>
            </Col>
            <Col span={6}>
              <p><strong>Thời gian nhận kết quả:</strong> {formatDate(test.actualResultTime)}</p>
            </Col>
            <Col span={6}>
              <Space>
                <EditOutlined
                  style={{ color: 'orange', cursor: 'pointer' }}
                  onClick={() => {
                    setDataUpdate(test)
                    setIsUpdateTestOrderModalOpen(true)
                  }}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      ))}

      <UpdateTestOrderModal
        isUpdateTestOrderModalOpen={isUpdateTestOrderModalOpen}
        setIsUpdateTestOrderModalOpen={setIsUpdateTestOrderModalOpen}
        dataUpdate={dataUpdate}
        testTypes={testTypes}
        onPreviewUpdate={(updatedTest) => {
          setTestOrderData((prev) =>
            prev.map((test) =>
              test.id === updatedTest.id
                ? { ...test, ...updatedTest }
                : test
            )
          )
        }}
      />
    </div>
  )
}

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
