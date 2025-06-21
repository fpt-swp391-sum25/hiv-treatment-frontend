import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  fetchHealthRecordByScheduleIdAPI,
  fetchTestResultByHealthRecordIdAPI,
} from "../../services/api.service.js";
import { Typography, Space, Button, Input, Card, Form, Row, Col, Divider } from 'antd';

const ViewOnlyPatientDetail = () => {
  const [healthRecordData, setHealthRecordData] = useState({});
  const [testResultData, setTestResultData] = useState([]);

  const { id } = useParams();
  const { Title } = Typography;
  const { Text } = Typography;

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  });

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
                <Text>{healthRecordData.roomCode || ''}</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số bảo hiểm y tế">
                <Text>{healthRecordData.insuranceNumber || ''}</Text>
              </Form.Item>
            </Col>
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
              <Form.Item label="Ghi chú">
                <Text>{healthRecordData.note || ''}</Text>
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
    </div>
  );
};

export default ViewOnlyPatientDetail;
