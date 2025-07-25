import React, { useState } from 'react';
import { DatePicker, Button, Row, Col, Space, Card, Radio, message } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './Dashboard.css';

const DashboardFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [filterType, setFilterType] = useState(initialFilters.filterType || 'month'); // month | quarter | year
  const [selectedDate, setSelectedDate] = useState(initialFilters.selectedDate ? dayjs(initialFilters.selectedDate) : null);

  // Chuyển selectedDate thành định dạng 'YYYY-MM-DD' phù hợp API
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
    setSelectedDate(null);

    onFilterChange({
      filterType: newType,
      selectedDate: null,
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

  return (
    <Card className="dashboard-filters-card mb-4">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={24} md={10} lg={6}>
          <div className="filter-item">
            <div className="filter-label">Loại thời gian</div>
            <Radio.Group value={filterType} onChange={handleFilterTypeChange}>
              <Radio.Button value="month">Tháng</Radio.Button>
              <Radio.Button value="quarter">Quý</Radio.Button>
              <Radio.Button value="year">Năm</Radio.Button>
            </Radio.Group>
          </div>
        </Col>

        <Col xs={24} sm={24} md={8} lg={6}>
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

        <Col xs={24} sm={24} md={6} lg={8} style={{ textAlign: 'right' }}>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Đặt lại
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default DashboardFilters;
