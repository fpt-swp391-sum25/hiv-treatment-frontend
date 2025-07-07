import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Input,
  Button,
  Select,
  Table,
  Tag,
  Modal,
  Descriptions,
  Divider,
  Spin,
  message
} from 'antd';
import {
  CalendarOutlined,
  FileOutlined,
  SearchOutlined,
  CloseOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { getSchedulesByPatientAPI } from '../../services/api.service';
import { healthRecordService } from '../../services/health-record.service';
import { AuthContext } from '../../components/context/AuthContext';
import { fetchTestResultByHealthRecordIdAPI } from '../../services/api.service';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

export default function PatientAppointmentHistory() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [healthRecord, setHealthRecord] = useState(null);
  const [loadingHealthRecord, setLoadingHealthRecord] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !user.id) {
        setRecords([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getSchedulesByPatientAPI(user.id);
        setRecords(res.data || []);
      } catch (error) {
        message.error('Lỗi khi tải lịch sử khám bệnh');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const fetchHealthRecord = async (scheduleId) => {
    setLoadingHealthRecord(true);
    setShowModal(true);
    try {
      const data = await healthRecordService.getHealthRecordByScheduleId(scheduleId);
      setHealthRecord(data);
      if (data && data.id) {
        const testRes = await fetchTestResultByHealthRecordIdAPI(data.id);
        setTestResults(testRes.data || []);
      } else {
        setTestResults([]);
      }
    } catch (error) {
      message.error('Lỗi khi tải hồ sơ sức khỏe');
      console.error('Error fetching health record:', error);
      setHealthRecord(null);
      setTestResults([]);
    } finally {
      setLoadingHealthRecord(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setHealthRecord(null);
    setTestResults([]);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Khám': return 'blue';
      case 'Tái khám': return 'green';
      case 'Tư vấn': return 'orange';
      default: return 'default';
    }
  };

  const filteredRecords = records.filter(record => {
    const doctorMatch = !searchDoctor ||
      (record.doctor && record.doctor.fullName &&
        record.doctor.fullName.toLowerCase().includes(searchDoctor.toLowerCase()));

    const typeMatch = selectedType === 'all' || (record.type && record.type.trim() === selectedType);

    return doctorMatch && typeMatch;
  });

  const typeStats = {
    'Khám': records.filter(r => r.type && r.type.trim() === 'Khám').length,
    'Tái khám': records.filter(r => r.type && r.type.trim() === 'Tái khám').length,
    'Tư vấn': records.filter(r => r.type && r.type.trim() === 'Tư vấn').length
  };

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const columns = [
    {
      title: 'Loại lịch',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {formatDateVN(date)}
        </div>
      ),
    },
    {
      title: 'Khung giờ',
      dataIndex: 'slot',
      key: 'slot',
      render: (slot) => (
        <div>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {slot ? slot.split(':').slice(0, 2).join(':') : ''}
        </div>
      ),
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
      render: (text) => (
        <div>
          <UserOutlined style={{ marginRight: 8 }} />
          {text || 'Không rõ bác sĩ'}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FileOutlined />}
          onClick={() => fetchHealthRecord(record.id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Lịch sử khám bệnh"
        bordered={false}
        extra={
          <div style={{ display: 'flex', gap: 16 }}>
            <Search
              placeholder="Tìm kiếm bác sĩ"
              allowClear
              enterButton={<SearchOutlined />}
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 180 }}
              onChange={setSelectedType}
              value={selectedType}
            >
              <Option value="all">Tất cả loại lịch</Option>
              <Option value="Khám">Khám</Option>
              <Option value="Tái khám">Tái khám</Option>
              <Option value="Tư vấn">Tư vấn</Option>
            </Select>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(pagination) => setPagination(pagination)}
          locale={{
            emptyText: searchDoctor || selectedType !== 'all'
              ? `Không tìm thấy lịch khám${searchDoctor ? ` với bác sĩ "${searchDoctor}"` : ''}${selectedType !== 'all' ? ` loại "${selectedType}"` : ''}`
              : 'Chưa có lịch khám nào'
          }}
        />
      </Card>

      <Modal
        title="Chi tiết lịch khám"
        visible={showModal}
        onCancel={closeModal}
        footer={[
          <Button key="back" onClick={closeModal}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {loadingHealthRecord ? (
          <Spin />
        ) : !healthRecord ? (
          <div>Không tìm thấy thông tin ca khám.</div>
        ) : (
          <div>
            {/* Thông tin lịch khám */}
            <Descriptions title="Thông tin lịch khám" bordered size="small" column={2}>
              <Descriptions.Item label="Ngày">{formatDateVN(healthRecord.schedule?.date)}</Descriptions.Item>
              <Descriptions.Item label="Khung giờ">{healthRecord.schedule?.slot ? healthRecord.schedule.slot.split(":").slice(0,2).join(":") : ''}</Descriptions.Item>
              <Descriptions.Item label="Loại lịch">{healthRecord.schedule?.type}</Descriptions.Item>
              <Descriptions.Item label="Bác sĩ">{healthRecord.schedule?.doctor?.fullName}</Descriptions.Item>
            </Descriptions>
            <Divider />
            {/* Thông tin bệnh nhân */}
            <Descriptions title="Thông tin bệnh nhân" bordered size="small" column={2}>
              <Descriptions.Item label="Mã bệnh nhân">{healthRecord.schedule?.patient?.displayId}</Descriptions.Item>
              <Descriptions.Item label="Tên bệnh nhân">{healthRecord.schedule?.patient?.fullName}</Descriptions.Item>
            </Descriptions>
            <Divider />
            {/* Thông tin sức khỏe */}
            <Descriptions title="Thông tin sức khỏe" bordered size="small" column={2}>
              <Descriptions.Item label="Chiều cao">{healthRecord.height}</Descriptions.Item>
              <Descriptions.Item label="Cân nặng">{healthRecord.weight}</Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">{healthRecord.bloodType}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái HIV">{healthRecord.hivStatus}</Descriptions.Item>
            </Descriptions>
            <Divider orientation="center">Phác đồ điều trị</Divider>
            {!healthRecord.regimen ? (
              <div>Chưa có phác đồ điều trị.</div>
            ) : (
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label="Tên phác đồ">{healthRecord.regimen.regimenName}</Descriptions.Item>
                <Descriptions.Item label="Thành phần">{healthRecord.regimen.components}</Descriptions.Item>
                <Descriptions.Item label="Chỉ định">{healthRecord.regimen.indications}</Descriptions.Item>
                <Descriptions.Item label="Chống chỉ định">{healthRecord.regimen.contraindications}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{healthRecord.regimen.description}</Descriptions.Item>
              </Descriptions>
            )}
            <Divider orientation="center">Kết quả xét nghiệm</Divider>
            {testResults.length === 0 ? (
              <div>Chưa có kết quả xét nghiệm.</div>
            ) : (
              testResults.map(test => (
                <Card key={test.id} style={{ marginBottom: 8 }}>
                  <Row>
                    <Col span={8}><b>Loại:</b> {test.type}</Col>
                    <Col span={8}><b>Kết quả:</b> {test.result} {test.unit}</Col>
                    <Col span={8}><b>Ghi chú:</b> {test.note}</Col>
                  </Row>
                  <Row>
                    <Col span={12}><b>Thời gian dự kiến:</b> {test.expectedResultTime ? dayjs(test.expectedResultTime).format('HH:mm DD-MM-YYYY') : ''}</Col>
                    <Col span={12}><b>Thời gian nhận kết quả:</b> {test.actualResultTime ? dayjs(test.actualResultTime).format('HH:mm DD-MM-YYYY') : ''}</Col>
                  </Row>
                </Card>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
