import React, { useState, useEffect, useContext } from 'react';
import {
  Card, Table, Tag, Modal, Descriptions, Divider, Spin, message,
  Input, Select, Button, Space, Row, Col, Typography
} from 'antd';
import {
  CalendarOutlined, ClockCircleOutlined, UserOutlined,
  FileTextOutlined, SearchOutlined, MedicineBoxOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSchedulesByPatientAPI, fetchTestResultByHealthRecordIdAPI } from '../../services/api.service';
import { healthRecordService } from '../../services/health-record.service';
import { AuthContext } from '../../components/context/AuthContext';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function PatientAppointmentHistory() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [healthRecord, setHealthRecord] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    const fetch = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await getSchedulesByPatientAPI(user.id);
        const sorted = (res.data || []).sort((a, b) => {
          const dateA = dayjs(`${a.date} ${a.slot}`, 'YYYY-MM-DD HH:mm:ss');
          const dateB = dayjs(`${b.date} ${b.slot}`, 'YYYY-MM-DD HH:mm:ss');
          return dateB - dateA;
        });
        setRecords(sorted);
      } catch (err) {
        message.error('Không thể tải lịch sử khám.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const handleFetchHealthRecord = async (scheduleId) => {
    setLoadingModal(true);
    setShowModal(true);
    try {
      const data = await healthRecordService.getHealthRecordByScheduleId(scheduleId);
      setHealthRecord(data);
      const testRes = data?.id ? await fetchTestResultByHealthRecordIdAPI(data.id) : { data: [] };
      setTestResults(testRes.data || []);
    } catch (err) {
      message.error('Không thể tải hồ sơ khám.');
      setHealthRecord(null);
      setTestResults([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setHealthRecord(null);
    setTestResults([]);
  };

  const filteredRecords = records.filter(r => {
    const doctorMatch = !searchDoctor || r.doctor?.fullName?.toLowerCase().includes(searchDoctor.toLowerCase());
    const typeMatch = selectedType === 'all' || r.type?.trim() === selectedType;
    return doctorMatch && typeMatch;
  });

  const getTypeColor = (type) => ({
    'Khám': 'blue',
    'Tái khám': 'green',
    'Tư vấn': 'orange'
  }[type] || 'default');

  const formatDate = (d) => dayjs(d).isValid() ? dayjs(d).format('DD-MM-YYYY') : '';

  const columns = [
    {
      title: 'Loại lịch',
      dataIndex: 'type',
      key: 'type',
      render: type => <Tag color={getTypeColor(type)}>{type}</Tag>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: d => <><CalendarOutlined /> {formatDate(d)}</>,
    },
    {
      title: 'Khung giờ',
      dataIndex: 'slot',
      key: 'slot',
      render: s => <><ClockCircleOutlined /> {s?.slice(0, 5)}</>,
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
      render: name => <><UserOutlined /> {name || 'Không rõ'}</>,
    },
    {
      title: '',
      key: 'action',
      render: (_, r) => (
        <Button type="primary" icon={<FileTextOutlined />} onClick={() => handleFetchHealthRecord(r.id)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, minHeight: '500px' }}>
      <Card
        title={<Title level={4}><FileDoneOutlined /> Lịch sử khám bệnh</Title>}
        extra={
          <Space>
            <Search
              allowClear
              placeholder="Tìm bác sĩ"
              onChange={e => setSearchDoctor(e.target.value)}
              style={{ width: 250 }}
            />
            <Select value={selectedType} onChange={setSelectedType} style={{ width: 160 }}>
              <Option value="all">Tất cả loại lịch</Option>
              <Option value="Khám">Khám</Option>
              <Option value="Tái khám">Tái khám</Option>
              <Option value="Tư vấn">Tư vấn</Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={setPagination}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />
      </Card>

      <Modal
        title={<Text strong><MedicineBoxOutlined /> Chi tiết lịch khám</Text>}
        open={showModal}
        onCancel={closeModal}
        footer={<Button onClick={closeModal}>Đóng</Button>}
        width={850}
        destroyOnClose
      >
        {loadingModal ? (
          <Spin />
        ) : !healthRecord ? (
          <Text type="danger">Không tìm thấy hồ sơ khám.</Text>
        ) : (
          <>
            <Divider orientation="left">
              <CalendarOutlined /> <Text strong>Lịch khám</Text>
            </Divider>
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 'bold', width: 180 }}
              contentStyle={{ paddingLeft: 16 }}
            >
              <Descriptions.Item label={<><CalendarOutlined /> Ngày</>}>
                <Tag color="blue">{formatDate(healthRecord.schedule?.date)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<><ClockCircleOutlined /> Giờ</>}>
                <Tag color="purple">{healthRecord.schedule?.slot?.slice(0, 5)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<><FileTextOutlined /> Loại lịch</>}>
                <Tag color={getTypeColor(healthRecord.schedule?.type)}>{healthRecord.schedule?.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined /> Bác sĩ</>}>
                {healthRecord.schedule?.doctor?.fullName}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <UserOutlined /> <Text strong>Bệnh nhân</Text>
            </Divider>
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 'bold', width: 180 }}
              contentStyle={{ paddingLeft: 16 }}
            >
              <Descriptions.Item label="Mã bệnh nhân">
                {healthRecord.schedule?.patient?.displayId}
              </Descriptions.Item>
              <Descriptions.Item label="Tên bệnh nhân">
                {healthRecord.schedule?.patient?.fullName}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <MedicineBoxOutlined /> <Text strong>Thông tin sức khỏe</Text>
            </Divider>
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 'bold', width: 180 }}
              contentStyle={{ paddingLeft: 16 }}
            >
              <Descriptions.Item label="Chiều cao">{healthRecord.height} cm</Descriptions.Item>
              <Descriptions.Item label="Cân nặng">{healthRecord.weight} kg</Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">{healthRecord.bloodType}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái HIV">
                <Tag color={healthRecord.hivStatus === 'Dương tính' ? 'red' : 'green'}>
                  {healthRecord.hivStatus}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <FileTextOutlined /> <Text strong>Phác đồ điều trị</Text>
            </Divider>
            {healthRecord.regimen ? (
              <Descriptions
                bordered
                column={1}
                size="middle"
                labelStyle={{ fontWeight: 'bold', width: 180 }}
                contentStyle={{ paddingLeft: 16 }}
              >
                <Descriptions.Item label="Tên">{healthRecord.regimen.regimenName}</Descriptions.Item>
                <Descriptions.Item label="Thành phần">{healthRecord.regimen.components}</Descriptions.Item>
                <Descriptions.Item label="Chỉ định">{healthRecord.regimen.indications}</Descriptions.Item>
                <Descriptions.Item label="Chống chỉ định">{healthRecord.regimen.contraindications}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{healthRecord.regimen.description}</Descriptions.Item>
              </Descriptions>
            ) : (
              <Text type="secondary">Chưa có phác đồ điều trị.</Text>
            )}

            <Divider orientation="left">
              <FileTextOutlined /> <Text strong>Kết quả xét nghiệm</Text>
            </Divider>
            {testResults.length === 0 ? (
              <Text type="secondary">Chưa có kết quả.</Text>
            ) : (
              testResults.map(test => (
                <Card key={test.id} size="small" style={{ marginBottom: 12 }} type="inner" title={test.type}>
                  <Row gutter={16}>
                    <Col span={12}><b>Kết quả:</b> {test.result} {test.unit}</Col>
                    <Col span={12}><b>Ghi chú:</b> {test.note || 'Không có'}</Col>
                    <Col span={12}><b>Dự kiến:</b> {test.expectedResultTime && dayjs(test.expectedResultTime).format('HH:mm DD-MM-YYYY')}</Col>
                    <Col span={12}><b>Thời gian nhận:</b> {test.actualResultTime && dayjs(test.actualResultTime).format('HH:mm DD-MM-YYYY')}</Col>
                  </Row>
                </Card>
              ))
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
