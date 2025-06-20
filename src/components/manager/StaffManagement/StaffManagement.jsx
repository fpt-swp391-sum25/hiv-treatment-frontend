import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Row, Col, Card, Statistic, Select, Input, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './StaffManagement.css';

const StaffManagement = () => {
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isProfileDetailVisible, setIsProfileDetailVisible] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState('all');
    const [searchText, setSearchText] = useState('');

    // Mock data
    const mockStaffs = [
        {
            id: 1,
            fullName: 'Nguyễn Thị D',
            email: 'staffd@example.com',
            phone: '0901111222',
            position: 'y tá',
            department: 'Tiếp nhận',
            description: 'Nhân viên thân thiện',
            certificates: 'Chứng chỉ giao tiếp',
            education: 'Cao đẳng Kinh tế',
            avatarUrl: '',
        },
        {
            id: 2,
            fullName: 'Trần Văn E',
            email: 'staffe@example.com',
            phone: '0911222333',
            position: 'y tá',
            department: 'Chăm sóc',
            description: 'Chăm sóc tận tâm',
            certificates: 'Chứng chỉ chăm sóc y tế',
            education: 'Đại học Y Hà Nội',
            avatarUrl: '',
        },
        {
            id: 3,
            fullName: 'Lê Thị F',
            email: 'stafff@example.com',
            phone: '0988777666',
            position: 'y tá',
            department: 'Tài chính',
            description: 'Kế toán viên nhiều kinh nghiệm',
            certificates: 'Chứng chỉ kế toán',
            education: 'Đại học Kinh tế Quốc dân',
            avatarUrl: '',
        },
    ];

    useEffect(() => {
        loadStaffs();
    }, []);

    const loadStaffs = async () => {
        setLoading(true);
        try {
            // Gọi API thật ở đây nếu có
            let data = mockStaffs;
            setStaffs(data);
        } catch (error) {
            setStaffs(mockStaffs);
            message.error('Không thể tải danh sách nhân viên, đang hiển thị dữ liệu mẫu');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (staff) => {
        setSelectedStaff(staff);
        setIsProfileDetailVisible(true);
    };

    const handleUpdateStaff = (staff) => {
        setSelectedStaff(staff);
        setIsUpdateModalVisible(true);
    };

    const handleUpdateSuccess = () => {
        message.success({
            content: 'Cập nhật thông tin thành công',
            duration: 2,
            style: { top: 80, right: 24, position: 'fixed' }
        });
        loadStaffs();
        setIsUpdateModalVisible(false);
    };

    const handleDelete = (staff) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa nhân viên ${staff.fullName}?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    setLoading(true);
                    // Gọi API xóa ở đây nếu có
                    const newStaffs = staffs.filter(s => s.id !== staff.id);
                    setStaffs(newStaffs);
                    message.success('Xóa nhân viên thành công');
                } catch (error) {
                    message.error('Không thể xóa nhân viên');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // Lọc danh sách nhân viên theo dropdown và search
    const filteredStaffs = staffs.filter((staff) => {
        const matchStaff = selectedStaffId === 'all' || staff.id === selectedStaffId;
        const matchName = staff.fullName.toLowerCase().includes(searchText.toLowerCase());
        return matchStaff && matchName;
    });

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            key: 'position',
        },
        // {
        //     title: 'Phòng ban',
        //     dataIndex: 'department',
        //     key: 'department',
        // },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleViewProfile(record)}>
                        Xem thông tin
                    </Button>
                    <Button onClick={() => handleUpdateStaff(record)}>
                        Cập nhật
                    </Button>
                    <Button onClick={() => handleDelete(record)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="staff-management">
            <Row gutter={[24, 24]} className="dashboard-stats" style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} lg={8}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
                            background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)',
                            minHeight: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        bodyStyle={{ padding: 24, textAlign: 'center' }}
                    >
                        <Statistic
                            title={<span style={{ color: '#64748b', fontWeight: 600, fontSize: 16 }}>Tổng số nhân viên</span>}
                            value={staffs.length}
                            prefix={<UserOutlined style={{ fontSize: 32, color: '#2563eb', marginRight: 8 }} />}
                            valueStyle={{ fontSize: 32, fontWeight: 700, color: '#22223b' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bộ lọc nhân viên và search */}
            <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
                <Col xs={24} sm={12} md={8} lg={6}>
                    <label style={{ fontWeight: 500 }}>Nhân viên:</label>
                    <Select
                        style={{ width: '100%' }}
                        value={selectedStaffId}
                        onChange={setSelectedStaffId}
                    >
                        <Select.Option value="all">Tất cả nhân viên</Select.Option>
                        {staffs.map((staff) => (
                            <Select.Option key={staff.id} value={staff.id}>
                                {staff.fullName}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <label style={{ fontWeight: 500 }}>Tìm kiếm theo tên:</label>
                    <Input
                        placeholder="Nhập tên nhân viên..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredStaffs}
                loading={loading}
                rowKey="id"
                className="staff-table"
            />

            {/* Modal cập nhật và xem chi tiết sẽ bổ sung sau */}
        </div>
    );
};

export default StaffManagement;
