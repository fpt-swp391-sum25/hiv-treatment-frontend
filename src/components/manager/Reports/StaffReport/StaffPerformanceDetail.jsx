import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Empty, Typography, Progress } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateStaffWorkload } from '../../../../services/report.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StaffPerformanceDetail = ({ staffId, role, staffName, dateRange }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [workloadData, setWorkloadData] = useState(null);

    useEffect(() => {
        const fetchWorkloadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await calculateStaffWorkload(staffId, role, dateRange[0], dateRange[1]);
                setWorkloadData(data);
            } catch (error) {
                console.error('Error fetching workload data:', error);
                setError(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (staffId && role && dateRange?.length === 2) {
            fetchWorkloadData();
        }
    }, [staffId, role, dateRange]);

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Đang tải dữ liệu...">
                    <div className="loading-content" />
                </Spin>
            </div>
        );
    }

    if (error) {
        return <Empty description={error} />;
    }

    if (!workloadData) {
        return <Empty description="Không có dữ liệu" />;
    }

    // Chuẩn bị dữ liệu cho biểu đồ
    const performanceData = Object.entries(workloadData.performanceByDate || {}).map(([date, data]) => ({
        date,
        'Tỷ lệ hoàn thành': data.rate,
        'Số công việc': data.total
    }));

    return (
        <div className="staff-performance-detail">
            <Card>
                <Title level={4}>{staffName} - Chi tiết hiệu suất</Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Tổng số công việc"
                                value={workloadData.totalTasks}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Đã hoàn thành"
                                value={workloadData.completedTasks}
                                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Đã hủy"
                                value={workloadData.cancelledTasks}
                                prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <Card title="Hiệu suất tổng thể">
                            <Progress
                                percent={Math.round(workloadData.averagePerformance)}
                                status="active"
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                            />
                            <Text type="secondary">
                                Tỷ lệ hoàn thành công việc trung bình trong khoảng thời gian
                            </Text>
                        </Card>
                    </Col>
                </Row>

                <Row style={{ marginTop: '24px' }}>
                    <Col span={24}>
                        <Card title="Biểu đồ hiệu suất theo thời gian">
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date"
                                        tickFormatter={(date) => dayjs(date).format('DD/MM')}
                                    />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip 
                                        labelFormatter={(date) => dayjs(date).format('DD/MM/YYYY')}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="Tỷ lệ hoàn thành"
                                        stroke="#1890ff"
                                        activeDot={{ r: 8 }}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="Số công việc"
                                        stroke="#52c41a"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default StaffPerformanceDetail; 