import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Spin,
  Space,
  Popconfirm,
  notification,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  fetchSystemConfigurationsAPI,
  updateSystemConfigurationAPI,
  createSystemConfigurationAPI,
  deleteSystemConfigurationAPI,
} from "../../services/api.service";

import "../../styles/admin/AdminDashboard.css";

const AdminSystemConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetchSystemConfigurationsAPI();
      setConfigs(res.data || []);
    } catch (error) {
      notification.error({
        message: "Lỗi tải cấu hình",
        description: "Không thể tải danh sách cấu hình hệ thống.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleValueChange = (id, value) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, value } : c
      )
    );
  };

  const handleNameChange = (id, name) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, name } : c
      )
    );
  };

  const handleAdd = () => {
    const newConfig = {
      id: `new-${Date.now()}`, 
      name: "",
      value: "",
      isNew: true,
    };
    setConfigs((prev) => [...prev, newConfig]);
  };

  const handleDelete = async (record) => {
    if (record.isNew) {
      setConfigs((prev) =>
        prev.filter((c) => c.id !== record.id)
      );
      return;
    }
    try {
      await deleteSystemConfigurationAPI(record.id);
      notification.success({
        message: "Xóa thành công",
        description: `Cấu hình "${record.name}" đã bị xóa.`,
      });
      loadConfigs();
    } catch (error) {
      notification.error({
        message: "Lỗi xóa",
        description: "Không thể xóa cấu hình.",
      });
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const config of configs) {
        console.log(">>>>> Config đang lưu:", config);

        if (config.isNew) {
          if (!config.name) {
            notification.warning({
              message: "Thiếu tên cấu hình",
              description: "Tên cấu hình không được để trống.",
            });
            continue;
          }
          await createSystemConfigurationAPI({
            name: config.name,
            value: config.value,
          });
        } else {
          await updateSystemConfigurationAPI(config.id, {
            name: config.name,
            value: config.value,
            });
        }
      }
      notification.success({
        message: "Lưu thành công",
        description: "Tất cả thay đổi đã được lưu.",
      });
      loadConfigs();
    } catch (error) {
      notification.error({
        message: "Lỗi lưu",
        description: "Có lỗi khi lưu thay đổi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Tên cấu hình",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Input
          value={record.name}
          onChange={(e) =>
            handleNameChange(record.id, e.target.value)
          }
          placeholder="Nhập tên"
        />
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (text, record) => (
        <Input
          value={record.value}
          onChange={(e) =>
            handleValueChange(record.id, e.target.value)
          }
          placeholder="Nhập giá trị"
        />
      ),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Bạn chắc chắn muốn xóa?"
          onConfirm={() => handleDelete(record)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button
            icon={<DeleteOutlined />}
            danger
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", margin: "100px auto" }}
      />
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <Card
        title="Cấu hình hệ thống"
        className="admin-dashboard-card"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm cấu hình
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSaveAll}
            >
              Lưu tất cả
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AdminSystemConfig;
