import {
  useParams,
  useNavigate,
  useLocation
} from "react-router-dom";
import {
  useState,
  useEffect,
  useContext
} from "react";
import {
  Typography,
  Space,
  Button,
  Card,
  Form,
  Row,
  Col,
  Divider,
  notification,
  Modal,
  Select,
  Input
} from 'antd';
import '../../styles/ReturnButton.css'
import {
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  Popconfirm
} from 'antd';
import {
  createNotification
} from "../../services/notification.service";
import {
  AuthContext
} from "../context/AuthContext.jsx";
import {
  fetchHealthRecordByScheduleIdAPI,
  fetchTestOrderByHealthRecordIdAPI,
  updateHealthRecordAPI
} from "../../services/health-record.service.js";
import {
  fetchRegimensByDoctorIdAPI
} from "../../services/regimen.service.js";
import {
  fetchUsersByRoleAPI
} from "../../services/user.service.js";
import {
  createTestOrderAPI,
  deleteTestOrderAPI
} from "../../services/testOrder.service.js";
import {
  getAllTestTypes
} from "../../services/testtype.service.js";

const PatientDetailDoctorView = () => {
  const [healthRecordData, setHealthRecordData] = useState({});
  const [testOrderData, setTestOrderData] = useState([]);
  const [isIndiateRegimenModalOpen, setIsIndiateRegimenModalOpen] = useState(false);
  const [regimenOptions, setRegimenOptions] = useState([]);
  const [selectedRegimenId, setSelectedRegimenId] = useState(null);
  const [isCreateTestOrderModalOpen, setIsCreateTestOrderModalOpen] = useState(false);
  const [newTestTypes, setNewTestTypes] = useState([]);
  const [currentTestType, setCurrentTestType] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [treatmentStatus, setTreatmentStatus] = useState("");
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const { Title, Text } = Typography;
  const [testTypes, setTestTypes] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get("tab");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const healthRecord = (await fetchHealthRecordByScheduleIdAPI(id)).data;
      if (healthRecord) {
        setHealthRecordData(healthRecord);
        setHeight(healthRecord.height || "");
        setWeight(healthRecord.weight || "");
        setTreatmentStatus(healthRecord.treatmentStatus || "");
        const testOrderRes = await fetchTestOrderByHealthRecordIdAPI(healthRecord.id);
        setTestOrderData(testOrderRes.data || []);
        const testTypeRes = await getAllTestTypes();
        setTestTypes(testTypeRes.data || []);
      }
      const regimenRes = await fetchRegimensByDoctorIdAPI(user.id);
      setRegimenOptions(regimenRes.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  };

  const handleUpdateHealthInfo = async () => {
    try {
      const updatedRecord = {
        ...healthRecordData,
        height,
        weight,
        treatmentStatus,
        scheduleId: healthRecordData.schedule.id,
        regimenId: healthRecordData.regimen?.id || null,
      };

      const response = await updateHealthRecordAPI(healthRecordData.id, updatedRecord);
      if (response.data) {
        notification.success({
          message: "Hệ thống",
          description: "Cập nhật thông tin sức khỏe thành công"
        });
        await loadData();
      } else {
        throw new Error("Không có dữ liệu trả về");
      }
    } catch {
      notification.error({
        message: "Hệ thống",
        description: "Cập nhật thông tin sức khỏe thất bại"
      });
    }
  };

  const handleIndicateRegimen = async () => {
    const updatedHealthRecord = {
      ...healthRecordData,
      height,
      weight,
      treatmentStatus,
      scheduleId: healthRecordData.schedule.id,
      regimenId: selectedRegimenId,
    };

    const response = await updateHealthRecordAPI(healthRecordData.id, updatedHealthRecord);
    if (response.data) {
      notification.success({
        message: "Hệ thống",
        description: "Cập nhật phác đồ thành công"
      });
    } else {
      notification.error({
        message: "Hệ thống",
        description: "Cập nhật phác đồ không thành công"
      });
    }
    await loadData();
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedRegimenId(null);
    setIsIndiateRegimenModalOpen(false);
    setIsCreateTestOrderModalOpen(false);
    setCurrentTestType("");
    setNewTestTypes([]);
  };

  const handleCreateTestOrdersBatch = async () => {
    try {
      if (newTestTypes.length === 0) {
        notification.warning({
          message: 'Thông báo',
          description: 'Vui lòng thêm ít nhất 1 loại xét nghiệm'
        });
        return;
      }

      for (const type of newTestTypes) {
        await createTestOrderAPI(type, "", "", healthRecordData.id);
      }

      const labTechRes = await fetchUsersByRoleAPI("LAB_TECHNICIAN");
      const labTechnicians = labTechRes.data || [];
      const patientName = healthRecordData.schedule?.patient?.fullName;

      await Promise.all(
        labTechnicians.map(labTech =>
          createNotification({
            title: "Yêu cầu xét nghiệm",
            message: `Yêu cầu kết quả xét nghiệm của bệnh nhân ${patientName}`,
            createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
            userId: labTech.id,
          })
        )
      );

      notification.success({
        message: 'Hệ thống',
        description: 'Tạo kết quả xét nghiệm thành công!'
      });

      resetAndClose();
      await loadData();
    } catch {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tạo kết quả xét nghiệm'
      });
    }
  };

  const handleDeleteTestOrder = async (testOrderId) => {
    try {
      const response = await deleteTestOrderAPI(testOrderId);
      if (response.data) {
        notification.success({
          message: 'Hệ thống',
          description: 'Xóa kết quả xét nghiệm thành công!'
        });
        await loadData();
      }
    } catch {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể xóa kết quả xét nghiệm'
      });
    }
  };

  return (
    <div style={{ margin: '0 10vw' }}>
      <Space direction="vertical" style={{ margin: '15px 0 0 0', width: "100%" }}>
        <Button
          type="primary"
          className="custom-yellow-btn"
          onClick={() => navigate(`/doctor/patients?tab=${tab || 'waiting'}`)}
        >
          Quay lại
        </Button>
        <Title level={3} style={{ textAlign: "center" }}>
          Chi tiết ca khám
        </Title>
      </Space>

      <Card title="Thông tin sức khỏe" style={{ marginTop: '5vh' }}>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Chiều cao">
                <Input value={height} onChange={(e) => setHeight(e.target.value)} suffix="cm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cân nặng">
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} suffix="kg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nhóm máu">
                <Text>{healthRecordData.bloodType || ''}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Trạng thái HIV">
                <Text>{healthRecordData.hivStatus || ''}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cập nhật trạng thái điều trị">
                <Select
                  value={treatmentStatus}
                  onChange={setTreatmentStatus}
                >
                  <Select.Option
                    value="Đang chờ khám"
                    label={<span style={{ color: "#faad14" }}>Đang chờ khám</span>}
                  >
                    <span style={{ color: "#faad14" }}>Đang chờ khám</span>
                  </Select.Option>
                  <Select.Option
                    value="Đã khám"
                    label={<span style={{ color: "#52c41a" }}>Đã khám</span>}
                  >
                    <span style={{ color: "#52c41a" }}>Đã khám</span>
                  </Select.Option>
                  <Select.Option
                    value="Đã tư vấn"
                    label={<span style={{ color: "#237804" }}>Đã tư vấn</span>}
                  >
                    <span style={{ color: "#237804" }}>Đã tư vấn</span>
                  </Select.Option>
                  <Select.Option
                    value="Không đến"
                    label={<span style={{ color: "#f5222d" }}>Không đến</span>}
                  >
                    <span style={{ color: "#f5222d" }}>Không đến</span>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: "right" }}>
              <Button type="primary" onClick={handleUpdateHealthInfo}>
                Cập nhật thông tin sức khỏe
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Divider orientation="center" style={{ marginTop: 10 + 'vh' }}>Kết quả xét nghiệm</Divider>

      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateTestOrderModalOpen(true)} style={{ marginBottom: 16 }}>
        Tạo mới
      </Button>

      <Modal
        title="Tạo kết quả xét nghiệm"
        open={isCreateTestOrderModalOpen}
        onOk={handleCreateTestOrdersBatch}
        onCancel={resetAndClose}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Loại xét nghiệm">
            <Input
              value={currentTestType}
              onChange={e => setCurrentTestType(e.target.value)}
              placeholder="Nhập loại xét nghiệm"
            />
            <Button
              type="dashed"
              style={{ marginTop: 8 }}
              icon={<PlusOutlined />}
              onClick={() => {
                if (currentTestType) {
                  setNewTestTypes(prev => [...prev, currentTestType]);
                  setCurrentTestType({ name: "", typeId: null });
                  setCurrentTestType('')
                }
              }}
            >
              Thêm xét nghiệm
            </Button>
          </Form.Item>
          <Form.Item label="Danh sách xét nghiệm sẽ tạo">
            {newTestTypes.length === 0 ? (
              <p><i>Chưa có xét nghiệm nào</i></p>
            ) : (
              <ul>
                {newTestTypes.map((type, index) => (
                  <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ flex: 1 }}>{type}</span>
                    <Button
                      type="default"
                      danger
                      size="small"
                      style={{ borderColor: 'red', color: 'red', marginLeft: 12 }}
                      onClick={() =>
                        setNewTestTypes(newTestTypes.filter((_, i) => i !== index))
                      }
                    >
                      Xóa
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {testOrderData.map((test) => (
        <Card key={test.id} style={{ marginTop: 16 }}>
          <Row gutter={5 + "vw"} align="middle">
            <Col span={6}>
              <p><strong>Tên:</strong> {test.name}</p>
            </Col>
            <Col span={6}>
              <p><strong>Loại:</strong> {test.type?.testTypeName || 'Chưa có'}</p>
            </Col>
            <Col span={6}>
              <p><strong>Kết quả:</strong> {test.result} {test.unit}</p>
            </Col>
          </Row>

          <Row gutter="5vw">
            <Col span={6}>
              <p><strong>Ghi chú:</strong> {test.note}</p>
            </Col>
            <Col span={6}>
              <p><strong>Thời gian dự kiến:</strong> {test.expectedResultTime && !isNaN(new Date(test.expectedResultTime))
                ? new Intl.DateTimeFormat('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour12: false,
                }).format(new Date(test.expectedResultTime))
                : ''
              }</p>
            </Col>
            <Col span={6}>
              <p><strong>Thời gian nhận kết quả:</strong> {test.actualResultTime && !isNaN(new Date(test.actualResultTime))
                ? new Intl.DateTimeFormat('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour12: false,
                }).format(new Date(test.actualResultTime))
                : ''
              }</p>
            </Col>
            <Col span={6} style={{ display: 'flex', alignItems: 'center' }}>
              <Space>
                <Popconfirm
                  title="Xoá kết quả?"
                  onConfirm={() => handleDeleteTestOrder(test.id)}
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

      {/* Display regimens */}
      <Divider orientation="center" style={{ marginTop: 10 + 'vh' }}>Phác đồ điều trị</Divider>

      {
        !healthRecordData.regimen ? (
          <div style={{ marginBottom: 15 }}>
            <p><strong>Hiện tại chưa có phác đồ</strong></p>
          </div>
        ) : (
          <Card style={{ marginBottom: 15 }}>
            {(() => {
              const selectedRegimen = healthRecordData.regimen;
              return selectedRegimen ? (
                <div>
                  <p><strong>{selectedRegimen.regimenName}</strong></p>
                  <p><strong>Thành phần</strong> {selectedRegimen.components}</p>
                  <p><strong>Mô tả</strong> {selectedRegimen.description}</p>
                  <p><strong>Chỉ định</strong> {selectedRegimen.indications}</p>
                  <p><strong>Chống chỉ định</strong> {selectedRegimen.contraindications}</p>
                </div>
              ) : (
                <p><em>Không tìm thấy thông tin phác đồ.</em></p>
              );
            })()}
          </Card>

        )
      }

      <div style={{ textAlign: "right", marginBottom: 15 }}>
        <Button
          type='primary'
          onClick={() => setIsIndiateRegimenModalOpen(true)}>
          Cập nhật phác đồ
        </Button>
      </div>

      {/* Indicate regimen modal */}
      <Modal
        title="Cập nhật phác đồ cho bệnh nhân"
        open={isIndiateRegimenModalOpen}
        onOk={handleIndicateRegimen}
        onCancel={resetAndClose}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Chọn phác đồ điều trị">
            <Select
              showSearch
              placeholder="Tìm kiếm theo tên, mô tả, chỉ định, thành phần..."
              value={selectedRegimenId}
              onChange={(value) => {
                if (value === '') {
                  Modal.confirm({
                    title: "Xác nhận bỏ phác đồ?",
                    content: "Bạn có chắc chắn muốn bỏ phác đồ điều trị khỏi bệnh nhân này?",
                    okText: "Đồng ý",
                    cancelText: "Hủy",
                    onOk: () => {
                      setSelectedRegimenId(null);
                    },
                  });
                } else {
                  setSelectedRegimenId(value);
                }
              }}
              optionFilterProp="children"
              optionLabelProp="label"
              filterOption={(input, option) => {
                const lower = input.toLowerCase();
                const content = [
                  option?.regimenName,
                  option?.description,
                  option?.indications,
                  option?.contraindications,
                  option?.components
                ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase();
                return content.includes(lower);
              }}
            >
              <Select.Option value="" label="Không có phác đồ">
                <strong>Không có phác đồ</strong>
              </Select.Option>
              {regimenOptions.map((regimen) => (
                <Select.Option
                  key={regimen.id}
                  value={regimen.id}
                  label={regimen.regimenName}
                  regimenName={regimen.regimenName}
                  description={regimen.description}
                  indications={regimen.indications}
                  contraindications={regimen.contraindications}
                  components={regimen.components}
                >
                  <div>
                    <strong>{regimen.regimenName}</strong>
                    <br />
                    <small><b>Thành phần:</b> {regimen.components}</small><br />
                    <small><b>Mô tả:</b> {regimen.description}</small><br />
                    <small><b>Chỉ định:</b> {regimen.indications}</small><br />
                    <small><b>Chống chỉ định:</b> {regimen.contraindications}</small><br />
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div >
  );
};
export default PatientDetailDoctorView;