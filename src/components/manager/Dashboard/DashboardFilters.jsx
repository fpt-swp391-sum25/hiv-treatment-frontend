import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Button, Row, Col, Space, Card } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import './Dashboard.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Component DashboardFilters cung cấp các bộ lọc cho Dashboard
 * @param {Object} props - Props của component
 * @param {Function} props.onFilterChange - Callback khi filter thay đổi
 * @param {Array} props.doctors - Danh sách bác sĩ
 * @param {Object} props.initialFilters - Giá trị filter ban đầu
 */
const DashboardFilters = ({ onFilterChange, doctors = [], initialFilters = {} }) => {
  // State cho các filter
  const [dateRange, setDateRange] = useState(initialFilters.dateRange || [null, null]);
  const [period, setPeriod] = useState(initialFilters.period || 'month');
  const [doctorId, setDoctorId] = useState(initialFilters.doctorId || null);
  
  // Các tùy chọn cho filter khoảng thời gian
  const periodOptions = [
    { label: 'Ngày', value: 'day' },
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Năm', value: 'year' },
  ];
  
  // Xử lý khi thay đổi khoảng thời gian
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };
  
  // Xử lý khi thay đổi chu kỳ
  const handlePeriodChange = (value) => {
    setPeriod(value);
    
    // Tự động cập nhật dateRange dựa trên period
    let start = null;
    let end = moment();
    
    switch (value) {
      case 'day':
        start = moment().startOf('day');
        break;
      case 'week':
        start = moment().subtract(1, 'weeks').startOf('day');
        break;
      case 'month':
        start = moment().subtract(1, 'months').startOf('day');
        break;
      case 'year':
        start = moment().subtract(1, 'years').startOf('day');
        break;
      default:
        start = moment().subtract(1, 'months').startOf('day');
    }
    
    setDateRange([start, end]);
  };
  
  // Xử lý khi thay đổi bác sĩ
  const handleDoctorChange = (value) => {
    setDoctorId(value);
  };
  
  // Xử lý reset filter
  const handleReset = () => {
    setDateRange([null, null]);
    setPeriod('month');
    setDoctorId(null);
    
    if (onFilterChange) {
      onFilterChange({
        dateRange: [null, null],
        period: 'month',
        doctorId: null
      });
    }
  };
  
  // Xử lý khi nhấn nút lọc
  const handleApplyFilter = () => {
    if (onFilterChange) {
      onFilterChange({
        dateRange,
        period,
        doctorId
      });
    }
  };
  
  return (
    <Card className="dashboard-filters-card mb-4">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={24} md={8} lg={6}>
          <div className="filter-item">
            <div className="filter-label">Khoảng thời gian</div>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
          </div>
        </Col>
        
        <Col xs={12} sm={12} md={6} lg={4}>
          <div className="filter-item">
            <div className="filter-label">Chu kỳ</div>
            <Select
              style={{ width: '100%' }}
              value={period}
              onChange={handlePeriodChange}
              placeholder="Chọn chu kỳ"
            >
              {periodOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        
        <Col xs={12} sm={12} md={6} lg={4}>
          <div className="filter-item">
            <div className="filter-label">Bác sĩ</div>
            <Select
              style={{ width: '100%' }}
              value={doctorId}
              onChange={handleDoctorChange}
              placeholder="Tất cả bác sĩ"
              allowClear
            >
              {doctors.map(doctor => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
        
        <Col xs={24} sm={24} md={4} lg={10} style={{ textAlign: 'right' }}>
          <Space>
            <Button 
              icon={<FilterOutlined />} 
              type="primary"
              onClick={handleApplyFilter}
            >
              Lọc
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Đặt lại
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default DashboardFilters; 