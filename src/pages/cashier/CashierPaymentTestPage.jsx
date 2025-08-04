import React, { useState } from 'react';
import { Input, Button, Card, message, Typography, Space, Divider, Modal, Tag, List } from 'antd';
import {
  searchSchedulesByNameAPI,
  getAllSchedulesAPI,

} from '../../services/schedule.service';
import {
  fetchHealthRecordByScheduleIdAPI,
  healthRecordService
} from '../../services/health-record.service';
import {
  getTestOrdersByHealthRecordIdAPI,
  confirmTestOrderPaymentAPI,
  undoTestOrderPaymentAPI,
} from '../../services/testOrder.service';

const { Title, Text } = Typography;

export default function CashierPaymentTestPage() {
  const [search, setSearch] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [testOrders, setTestOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  const fetchSchedules = async () => {
    if (!search.trim()) {
      setSchedules([]);
      message.warning('Vui lòng nhập tên bệnh nhân để tìm kiếm');
      return;
    }

    try {
      const res = await searchSchedulesByNameAPI(search);

      const enhancedSchedules = await Promise.all(
        res.data.map(async (schedule) => {
          try {
            const healthRecord = await fetchHealthRecordByScheduleIdAPI(schedule.id);
            const testOrdersRes = await getTestOrdersByHealthRecordIdAPI(healthRecord.data.id);
            const testOrders = testOrdersRes.data;
            const isPaid = testOrders.length > 0 && testOrders.every(order => order.paymentStatus === 'Đã thanh toán');

            return { ...schedule, isPaid, testOrders, healthRecordId: healthRecord.id };

          } catch {
            return { ...schedule, isPaid: false, testOrders: [] };
          }
        })
      );

      enhancedSchedules.sort((a, b) => new Date(b.date) - new Date(a.date));

      const filteredSchedules = enhancedSchedules.filter(schedule =>
        schedule.patient?.id != null &&
        Array.isArray(schedule.testOrders) &&
        schedule.testOrders.length > 0
      );

      setSchedules(filteredSchedules);
      return filteredSchedules;
    } catch {
      message.error('Không thể tải danh sách lịch hẹn');
    }
  };

  const fetchAllSchedules = async () => {
    try {
      const res = await getAllSchedulesAPI();

      const enhancedSchedules = await Promise.all(
        res.data.map(async (schedule) => {
          try {
            const healthRecord = await fetchHealthRecordByScheduleIdAPI(schedule.id);
            const testOrdersRes = await getTestOrdersByHealthRecordIdAPI(healthRecord.data.id);
            const testOrders = testOrdersRes.data;
            const isPaid = testOrders.length > 0 && testOrders.every(order => order.paymentStatus === 'Đã thanh toán');

            return { ...schedule, isPaid, testOrders, healthRecordId: healthRecord.id };

          } catch {
            return { ...schedule, isPaid: false, testOrders: [] };
          }
        })
      );

      enhancedSchedules.sort((a, b) => new Date(b.date) - new Date(a.date));

      const filteredSchedules = enhancedSchedules.filter(schedule =>
        schedule.patient?.id != null &&
        Array.isArray(schedule.testOrders) &&
        schedule.testOrders.length > 0
      );

      setSchedules(filteredSchedules);
      return filteredSchedules;
    } catch {
      message.error('Không thể tải tất cả lịch hẹn');
    }
  };

  const fetchTestOrders = async (scheduleId) => {
    try {
      const healthRecord = await fetchHealthRecordByScheduleIdAPI(scheduleId);
      const res = await getTestOrdersByHealthRecordIdAPI(healthRecord.data.id);
      setTestOrders(res.data);
      const total = res.data.reduce((sum, order) => sum + (order.type?.testTypePrice || 0), 0);
      setTotalPrice(total);
    } catch {
      message.error('Không thể tải danh sách xét nghiệm');
    }
  };

  const handleSelectSchedule = (record) => {
    setSelectedSchedule(record);
    fetchTestOrders(record.id);
    setIsPaid(record.isPaid);
  };

  const handlePayment = () => {
    Modal.confirm({
      title: 'Xác nhận thanh toán?',
      content: `Tổng tiền là ${totalPrice.toLocaleString()} VND. Bạn có chắc muốn thanh toán không?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const healthRecord = await fetchHealthRecordByScheduleIdAPI(selectedSchedule.id);
          await confirmTestOrderPaymentAPI(healthRecord.data.id, totalPrice);

          let updatedSchedules;
          if (!search.trim()) {
            updatedSchedules = await fetchAllSchedules();
          } else {
            updatedSchedules = await fetchSchedules();
          }

          const updated = updatedSchedules.find(s => s.id === selectedSchedule.id);
          if (updated) {
            setSelectedSchedule(updated);
            setIsPaid(updated.isPaid);
          }

          message.success('Thanh toán thành công');
        } catch {
          message.error('Tải dữ liệu thất bại');
        }
      }
    });
  };

  const handleUndoPayment = () => {
    Modal.confirm({
      title: 'Hoàn tác thanh toán?',
      content: 'Bạn có chắc muốn hoàn tác thanh toán này không?',
      okText: 'Hoàn tác',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const healthRecord = await fetchHealthRecordByScheduleIdAPI(selectedSchedule.id);
          await undoTestOrderPaymentAPI(healthRecord.data.id);

          let updatedSchedules;
          if (!search.trim()) {
            updatedSchedules = await fetchAllSchedules();
          } else {
            updatedSchedules = await fetchSchedules();
          }

          const updated = updatedSchedules.find(s => s.id === selectedSchedule.id);
          if (updated) {
            setSelectedSchedule(updated);
            setIsPaid(updated.isPaid);
          }

          message.success('Hoàn tác thanh toán thành công');
        } catch {
          message.error('Hoàn tác thất bại');
        }
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hour, minute] = timeString.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 VND';
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>Thanh Toán Xét Nghiệm</Title>

      <Space style={{ marginBottom: 24 }}>
        <Input
          placeholder="Nhập tên bệnh nhân..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={fetchSchedules}>Tìm kiếm</Button>
        <Button onClick={fetchAllSchedules}>Hiển thị tất cả</Button>
      </Space>

      <div style={{ display: 'flex', gap: 24 }}>
        <Card title="Danh sách lịch hẹn" style={{ flex: 1 }}>
          <List
            dataSource={schedules}
            pagination={{
              pageSize: 5,
            }}
            renderItem={(record) => {
              const schedule = record || {};
              return (
                <List.Item
                  key={record.id}
                  onClick={() => handleSelectSchedule(record)}
                  style={{
                    padding: 12,
                    marginBottom: 12,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    backgroundColor: selectedSchedule?.id === record.id ? '#e6f7ff' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <Text strong>Bệnh nhân:</Text> {schedule.patient?.fullName || 'N/A'}<br />
                    <Text strong>Ngày:</Text> {formatDate(schedule.date)}<br />
                    <Text strong>Giờ:</Text> {formatTime(schedule.slot)}<br />
                    <Text strong>Trạng thái:</Text>{' '}
                    {record.isPaid ? (
                      <Tag color="green">Đã thanh toán</Tag>
                    ) : (
                      <Tag color="orange">Chưa thanh toán</Tag>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>

        <Card title="Chi tiết xét nghiệm" style={{ flex: 1 }}>
          {selectedSchedule ? (
            <>
              {testOrders.length === 0 ? (
                <Text italic>Không có xét nghiệm</Text>
              ) : (
                <>
                  {testOrders.map((order) => (
                    <div key={order.id} style={{ marginBottom: 12 }}>
                      <Text><strong>Tên:</strong> {order.name}</Text><br />
                      <Text><strong>Loại:</strong> {order.type?.testTypeName || 'Không xác định'}</Text><br />
                      <Text><strong>Giá:</strong> {formatCurrency(order.type?.testTypePrice)}</Text>
                      <Divider />
                    </div>
                  ))}
                </>
              )}
              <div style={{ marginTop: 16 }}>
                <Text strong style={{ fontSize: 16 }}>
                  {testOrders.length === 0
                    ? ''
                    : `Tổng tiền: ${formatCurrency(totalPrice)}`}
                </Text>

                {testOrders.length > 0 && (
                  !isPaid ? (
                    <Button type="primary" block style={{ marginTop: 12 }} onClick={handlePayment}>
                      Xác nhận thanh toán
                    </Button>
                  ) : (
                    <Button danger block style={{ marginTop: 12 }} onClick={handleUndoPayment}>
                      Hoàn tác thanh toán
                    </Button>
                  )
                )}
              </div>
            </>
          ) : (
            <Text type="secondary">Chọn một lịch hẹn để xem thông tin xét nghiệm.</Text>
          )}
        </Card>
      </div>
    </div>
  );
}
