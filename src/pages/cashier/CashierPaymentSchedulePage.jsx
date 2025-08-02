import { useState } from 'react';
import {
  Table,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Typography,
  Space,
  message,
  Modal
} from 'antd';
import {
  getPaymentsByFilter,
  togglePaymentStatus
} from '../../services/payment.service';
import { createHealthRecordByPaymentIdAPI } from '../../services/health-record.service';

const { Title } = Typography;

export default function CashierPaymentSchedulePage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchPayments = async (keyword = '') => {
    setLoading(true);
    try {
      const [pending, completed] = await Promise.all([
        getPaymentsByFilter('Chờ thanh toán', keyword, 'Tiền mặt'),
        getPaymentsByFilter('Đã thanh toán', keyword, 'Tiền mặt'),
      ]);

      const allPayments = [...pending, ...completed].sort((a, b) => {
        const dateA = new Date(a.schedule?.date);
        const dateB = new Date(b.schedule?.date);
        return dateB - dateA;
      });

      setPayments(allPayments);
    } catch {
      message.error('Lỗi khi tải thanh toán');
    } finally {
      setHasSearched(true);
      setLoading(false);
    }
  };


  const handleSearch = () => {
    const trimmed = searchName.trim();
    if (!trimmed) {
      message.warning('Vui lòng nhập tên bệnh nhân để tìm kiếm');
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    fetchPayments(trimmed);
  };



  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const [hour, minute] = timeStr.split(':');
    return `${hour}:${minute}`;
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    });
  };

  const handleToggleStatus = (payment) => {
    const { id, status, amount, schedule } = payment;
    const isPending = status === 'Chờ thanh toán';

    Modal.confirm({
      title: isPending ? 'Xác nhận thanh toán' : 'Hoàn tác thanh toán',
      content: (
        <div>
          <div style={{ marginBottom: 12, color: '#888' }}>
            Bạn có chắc muốn <strong>{isPending ? 'xác nhận' : 'hoàn tác'}</strong> thanh toán cho lịch khám sau?
          </div>
          <div>
            <p><b>Bệnh nhân:</b> {schedule?.patient?.fullName || 'N/A'}</p>
            <p><b>Ngày khám:</b> {formatDate(schedule?.date)}</p>
            <p><b>Giờ khám:</b> {formatTime(schedule?.slot)}</p>
            <p><b>Số tiền:</b> {formatCurrency(amount)}</p>
          </div>
        </div>
      ),
      okText: 'Có',
      cancelText: 'Không',
      onOk: async () => {
        setLoading(true);
        try {
          await togglePaymentStatus(id);
          await createHealthRecordByPaymentIdAPI(id);
          await fetchPayments(searchName.trim());
          message.success('Cập nhật trạng thái thành công');
        } catch {
          message.error('Lỗi cập nhật trạng thái');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: '#',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã bệnh nhân',
      dataIndex: ['schedule', 'patient', 'displayId'],
      render: (text) => text || 'N/A',
    },
    {
      title: 'Tên bệnh nhân',
      dataIndex: ['schedule', 'patient', 'fullName'],
      render: (text) => text || 'N/A',
    },
    {
      title: 'Ngày khám',
      dataIndex: ['schedule', 'date'],
      render: (text) => formatDate(text),
    },
    {
      title: 'Giờ khám',
      dataIndex: ['schedule', 'slot'],
      render: (text) => formatTime(text),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
    },
    {
      title: 'Hành động',
      dataIndex: 'id',
      render: (_, record) => (
        <Button
          type={record.status === 'Chờ thanh toán' ? 'primary' : 'default'}
          danger={record.status !== 'Chờ thanh toán'}
          size="small"
          onClick={() => handleToggleStatus(record)}
        >
          {record.status === 'Chờ thanh toán' ? 'Xác nhận' : 'Hoàn tác'}
        </Button>
      ),
    }
  ];

  return (
    <div className="container" style={{ padding: 24 }}>
      <Title level={3}>
        Thanh Toán Lịch Khám Bằng Tiền Mặt
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Input
            placeholder="Nhập tên bệnh nhân..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            allowClear
          />
        </Col>
        <Col>
          <Space>
            <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
            <Button onClick={() => fetchPayments('')}>Hiện tất cả</Button>
          </Space>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        hasSearched && (
          <Table
            dataSource={payments}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 20,
            }}
            locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
          />
        )
      )}
    </div>
  );
}
