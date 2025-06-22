  import { useParams, useNavigate } from "react-router-dom";
  import { useState, useEffect } from "react";
  import {
    fetchHealthRecordByScheduleIdAPI,
    fetchTestResultByHealthRecordIdAPI,
    fetchRegimensByDoctorIdAPI,
    updateHealthRecordAPI
  } from "../../services/api.service.js";
  import { Typography, Space, Button, Card, Form, Row, 
    Col, Divider, notification, Modal, 
    Select} from 'antd';
import '../../styles/ReturnButton.css'

  const ViewOnlyPatientDetail = () => {
    const [healthRecordData, setHealthRecordData] = useState({})
    const [testResultData, setTestResultData] = useState([])
    const [isIndiateRegimenModalOpen, setIsIndiateRegimenModalOpen] = useState(false)
    const [regimenOptions, setRegimenOptions] = useState([]); 
    const [selectedRegimenId, setSelectedRegimenId] = useState(null); 

    const { id } = useParams();
    const { Title } = Typography;
    const { Text } = Typography;

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
        const regimenRes = await fetchRegimensByDoctorIdAPI(7);
        setRegimenOptions(regimenRes.data || []);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    const handleIndicateRegimen = async () => {
      const updatedHealthRecord = {
        height: healthRecordData.height,
        weight: healthRecordData.weight,
        bloodType: healthRecordData.bloodType,
        hivStatus: healthRecordData.hivStatus,
        treatmentStatus: healthRecordData.treatmentStatus,
        scheduleId: healthRecordData.schedule.id,
        regimenId: selectedRegimenId
      };

      console.log(updatedHealthRecord)
      const response = await updateHealthRecordAPI(healthRecordData.id, updatedHealthRecord);

      if (response.data) {
        notification.success({
          title: "Hệ thống",
          description: "Chỉ định phác đồ thành công"
        })
      } else {
        notification.error({
          title: "Hệ thống",
          description: "Chỉ định phác đồ không thành công"
        })
      }
      await loadData();
      resetAndClose()
    }

    const resetAndClose = () => {
      setSelectedRegimenId(null);
      setIsIndiateRegimenModalOpen(false)
    }

    const handleUpdateTreatmentStatus = async (newStatus) => {
      try {
        const updatedRecord = {
          ...healthRecordData,
          treatmentStatus: newStatus,
          scheduleId: healthRecordData.schedule.id,
          regimenId: healthRecordData.regimen?.id || null,
        };

        const response = await updateHealthRecordAPI(healthRecordData.id, updatedRecord);

        if (response.data) {
          notification.success({
            message: "Hệ thống",
            description: "Cập nhật trạng thái điều trị thành công"
          });
          loadData();
        } else {
          throw new Error("Không có dữ liệu trả về");
        }
      } catch (error) {
        notification.error({
          message: "Hệ thống",
          description: "Cập nhật trạng thái điều trị thất bại"
        });
      }
    };

    return (
      <div style = {{marginRight: 10 + 'vw', marginLeft: 10 + 'vw'}}>
        <Space direction="vertical" style={{ margin: '15px 0 0 0', width: "100%" }}>
          <Button
            type="primary"
            className="custom-yellow-btn"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>

          <Title level={3} style={{ textAlign: "center", width: "100%" }}>
            Chi tiết ca khám
          </Title>
        </Space>

        <Card title="Thông tin sức khỏe" style={{ marginTop: 5 + 'vh'}}>
          <Form layout="vertical">
            <Row gutter={16}>          
              <Col span={12}>
                <Form.Item label="Chiều cao">
                  <Text>{healthRecordData.height || ''}</Text>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Cân nặng">
                  <Text>{healthRecordData.weight || ''}</Text>
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
                <Form.Item label="Trạng thái điều trị">
                  <Text>{healthRecordData.treatmentStatus || ''}</Text>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Cập nhật trạng thái điều trị">
                  <Select
                    value={healthRecordData.treatmentStatus}
                    onChange={handleUpdateTreatmentStatus}
                  >
                    <Select.Option value="Đang chờ khám">Đang chờ khám</Select.Option>
                    <Select.Option value="Đã khám">Đã khám</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Divider orientation="center" style = {{marginTop: 10 + 'vh'}}>Kết quả xét nghiệm</Divider>

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
              <p><strong>Thời gian dự kiến:</strong> {new Date(test.expectedResultTime).toLocaleString('vi-VN')}</p>
              </Col>
              <Col span={8}>
                <p><strong>Thời gian nhận kết quả:</strong> {new Date(test.actualResultTime).toLocaleString('vi-VN')}</p>
              </Col>
            </Row>
          </Card>
        ))}

        {/* Display regimen */}        
        <Divider orientation="center" style={{ marginTop: 10 + 'vh' }}>Phác đồ điều trị</Divider>
        
        {!healthRecordData.regimen ? (
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

        )}

        <div style={{ textAlign: "right", marginBottom: 15 }}>
          <Button type='primary' onClick={() => setIsIndiateRegimenModalOpen(true)}>
            {healthRecordData.regimenId ? "Thay đổi phác đồ" : "Chỉ định phác đồ"}
          </Button>
        </div>

        {/* Indicate regimen modal */}
        <Modal
          title="Chỉ định phác đồ cho bệnh nhân"
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
                onChange={(value) => setSelectedRegimenId(value)}
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
      </div>
    );
  };

  export default ViewOnlyPatientDetail;
