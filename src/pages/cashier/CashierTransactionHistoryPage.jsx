import { useState, useMemo } from 'react';
import { Input, Button, Typography, Card, Tag, Divider, message, Pagination } from 'antd';
import { getTestOrdersByHealthRecordIdAPI } from '../../services/testOrder.service';
import { getPaymentByScheduleIdAPI } from '../../services/payment.service';
import dayjs from 'dayjs';
import { searchSchedulesByNameAPI } from '../../services/schedule.service';
import { fetchHealthRecordByScheduleIdAPI } from '../../services/health-record.service';

const { Title, Text } = Typography;

export default function CashierTransactionHistoryPage() {
  const [search, setSearch] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;

  const fetchSchedulesWithDetails = async () => {
    if (!search.trim()) {
      message.warning('Vui lòng nhập tên bệnh nhân để tìm kiếm');
      return;
    }
    setLoading(true);
    try {
      const res = await searchSchedulesByNameAPI(search);
      const allSchedules = res.data || [];

      allSchedules.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (allSchedules.length === 0) {
        setSchedules([]);
        message.warning('Không tìm thấy bệnh nhân phù hợp');
        return;
      }

      const detailedSchedules = await Promise.all(
        allSchedules.map(async (schedule) => {
          try {
            const [healthRecordRes, paymentRes] = await Promise.all([
              fetchHealthRecordByScheduleIdAPI(schedule.id),
              getPaymentByScheduleIdAPI(schedule.id),
            ]);

            const healthRecord = healthRecordRes.data;

            let testOrdersRes = { data: [] };
            if (healthRecord?.id) {
              testOrdersRes = await getTestOrdersByHealthRecordIdAPI(healthRecord.id);
            }

            return {
              ...schedule,
              testOrders: testOrdersRes.data || [],
              payment: paymentRes.data || null,
              healthRecord,
            };
          } catch (error) {
            console.error('Lỗi khi lấy chi tiết lịch khám:', error);
            return schedule;
          }
        })
      );


      setSchedules(detailedSchedules);
      setCurrentPage(1);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      message.error('Lỗi khi lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentTag = (schedulePaid, testOrders) => {
    const unpaidOrders = testOrders
      .filter(order => !(order.paymentStatus === 'Đã thanh toán'))
      .map(order => order.name)
      .filter(Boolean);
    if (!schedulePaid && unpaidOrders.length === 0) {
      return <Tag color="orange">Lịch khám chưa thanh toán</Tag>;
    }
    if (schedulePaid && unpaidOrders.length > 0) {
      return (
        <Tag color="orange">
          Xét nghiệm {unpaidOrders.join(', ')} chưa thanh toán
        </Tag>
      );
    }
    if (!schedulePaid && unpaidOrders.length > 0) {
      return (
        <Tag color="orange">
          Lịch khám và xét nghiệm chưa thanh toán
        </Tag>
      );
    }
    return <Tag color="green">Đã thanh toán</Tag>;
  };


  const formatCurrency = (number) =>
    number?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 ₫';

  const formatDate = (dateString) =>
    dayjs(dateString).isValid() ? dayjs(dateString).format('DD/MM/YYYY') : 'N/A';

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const parts = timeString.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeString;
  };

  const pagedSchedules = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return schedules.slice(start, start + pageSize);
  }, [schedules, currentPage]);

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Title level={3}>Tra cứu lịch sử giao dịch</Title>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <Input
          placeholder="Nhập tên bệnh nhân..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={fetchSchedulesWithDetails}
        />
        <Button type="primary" onClick={fetchSchedulesWithDetails} loading={loading}>
          Tìm kiếm
        </Button>
      </div>

      {pagedSchedules.map((schedule) => {
        const { testOrders, payment } = schedule;
        const schedulePaid = payment?.status === 'Đã thanh toán' || payment?.status === 'Thanh toán thành công'
        const testOrderPaid = testOrders.length > 0 && testOrders.every((o) => o.paymentStatus === 'Đã thanh toán');
        const testTotal = testOrders.reduce((sum, order) => sum + (order.type?.testTypePrice || 0), 0);
        const examFee = payment?.amount || 0;
        const total = testTotal + examFee;
        const allPaid = schedulePaid && testOrderPaid

        return (
          <Card key={schedule.id} title={`Lịch hẹn ngày ${formatDate(schedule.date)} - Giờ ${formatTime(schedule.slot)}`} style={{ marginBottom: 24 }}>
            <Text strong>Bệnh nhân:</Text> {schedule.patient?.fullName || 'N/A'} <br />
            <Text strong>Loại:</Text> {schedule.type || 'N/A'} <br />
            <Text strong>Giá tiền:</Text> {formatCurrency(payment?.amount) || 'Không xác định'} <br />
            <Text strong>Phương thức thanh toán:</Text> {payment?.description || 'Không xác định'} <br />

            <Divider />

            {testOrders.length > 0 ? (
              <>
                {testOrders.map((order) => (
                  <div key={order.id} style={{ marginBottom: 12 }}>
                    <Text><strong>Tên:</strong> {order.name}</Text> <br />
                    <Text><strong>Loại:</strong> {order.type?.testTypeName || 'Không xác định'}</Text> <br />

                    <Divider />
                  </div>
                ))}
              </>
            ) : (
              <Text italic>Không có xét nghiệm</Text>
            )}

            <Divider />
            <Text><strong>Trạng thái:</strong> {renderPaymentTag(schedulePaid, testOrders)}</Text>
            {(testTotal > 0 || examFee > 0) && (
              <Text strong style={{ fontSize: 16, padding: 15 }}>
                Tổng tiền: {formatCurrency(total)}
              </Text>
            )}
          </Card>
        );
      })}

      {!loading && schedules.length > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={schedules.length}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
