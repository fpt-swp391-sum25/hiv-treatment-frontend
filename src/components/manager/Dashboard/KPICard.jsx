import React from 'react';
import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './Dashboard.css';

/**
 * Component KPICard hiển thị một chỉ số KPI với giá trị và xu hướng
 * @param {Object} props - Props của component
 * @param {string} props.title - Tiêu đề của KPI
 * @param {number|string} props.value - Giá trị của KPI
 * @param {number} props.trend - Phần trăm thay đổi (dương là tăng, âm là giảm)
 * @param {string} props.trendLabel - Nhãn mô tả xu hướng
 * @param {string} props.type - Loại KPI (success, warning, danger, info)
 * @param {boolean} props.loading - Trạng thái loading
 * @param {React.ReactNode} props.icon - Icon hiển thị
 */
const KPICard = ({ 
  title, 
  value, 
  trend = null, 
  trendLabel = '', 
  type = 'info',
  loading = false,
  icon = null
}) => {
  // Xác định class cho card dựa vào type
  const cardClassName = `kpi-card kpi-card-${type}`;
  
  // Xác định class và icon cho trend
  let trendClass = '';
  let TrendIcon = null;
  
  if (trend !== null) {
    if (trend > 0) {
      trendClass = 'trend-up';
      TrendIcon = ArrowUpOutlined;
    } else if (trend < 0) {
      trendClass = 'trend-down';
      TrendIcon = ArrowDownOutlined;
    }
  }
  
  return (
    <Card 
      className={cardClassName}
      loading={loading}
      bordered={false}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="kpi-title">{title}</div>
      <div className="kpi-content">
        <div className="kpi-value-container">
          {icon && <div className="kpi-icon">{icon}</div>}
          <div className="kpi-value">{value}</div>
        </div>
        
        {trend !== null && TrendIcon && (
          <div className={`kpi-trend ${trendClass}`}>
            <TrendIcon />
            <span>
              {Math.abs(trend)}% {trendLabel}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default KPICard; 