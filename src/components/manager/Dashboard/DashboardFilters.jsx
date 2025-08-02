import { useState, useEffect } from 'react';
import { DatePicker, Button, Row, Col, Card, Radio } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '../../../styles/manager/Dashboard.css';

const DashboardFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filterType, setFilterType] = useState(initialFilters.filterType || 'month'); 
  const [selectedDate, setSelectedDate] = useState(initialFilters.selectedDate ? dayjs(initialFilters.selectedDate) : null);

  const formatSelectedDateForAPI = (date, type) => {
    if (!date) return null;

    const d = dayjs(date);
    switch (type) {
      case 'month':
        return d.startOf('month').format('YYYY-MM-DD');
      case 'quarter':
        return d.startOf('quarter').format('YYYY-MM-DD');
      case 'year':
        return d.startOf('year').format('YYYY-MM-DD');
      default:
        return d.format('YYYY-MM-DD');
    }
  };

  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    const today = dayjs();
    const formattedDate = formatSelectedDateForAPI(today, newType);

    setSelectedDate(today);
    onFilterChange({
      filterType: newType,
      selectedDate: formattedDate,
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);

    const formattedDate = formatSelectedDateForAPI(date, filterType);

    onFilterChange({
      filterType,
      selectedDate: formattedDate,
    });
  };

  const handleReset = () => {
    setFilterType('month');
    setSelectedDate(null);
    onFilterChange({
      filterType: 'month',
      selectedDate: null,
    });
  };

  useEffect(() => {
    if (!initialFilters.selectedDate) {
      const today = dayjs();
      const formattedDate = formatSelectedDateForAPI(today, filterType);
      setSelectedDate(today);
      onFilterChange({
        filterType,
        selectedDate: formattedDate,
      });
    }
  }, []);

  return (
    <Card className="dashboard-filters-card mb-4">
      <Row gutter={[24, 16]} align="middle" justify="center">
        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
          <div className="filter-item">
            <div className="filter-label">Loại thời gian</div>
            <Radio.Group value={filterType} onChange={handleFilterTypeChange} className="filter-radio-group">
              <Radio.Button value="month">Tháng</Radio.Button>
              <Radio.Button value="quarter">Quý</Radio.Button>
              <Radio.Button value="year">Năm</Radio.Button>
            </Radio.Group>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
          <div className="filter-item">
            <div className="filter-label">Thời điểm</div>
            <DatePicker
              picker={filterType}
              style={{ width: '100%' }}
              value={selectedDate}
              onChange={handleDateChange}
              format={
                filterType === 'year'
                  ? 'YYYY'
                  : filterType === 'month'
                  ? 'MM/YYYY'
                  : '[Q]Q/YYYY'
              }
              placeholder="Chọn thời điểm"
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={8} lg={6} xl={5} style={{ textAlign: 'center' }}>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleReset}
            className="filter-reset-button"
          >
            Đặt lại
          </Button>
        </Col>
      </Row>
    </Card>
  );
};
export default DashboardFilters;
