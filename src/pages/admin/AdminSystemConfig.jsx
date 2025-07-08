import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Spin,
  Space,
  notification,
} from "antd";
import {
  SaveOutlined,
} from "@ant-design/icons";
import {
  fetchSystemConfigurationsAPI,
  updateSystemConfigurationAPI,
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

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const config of configs) {
        await updateSystemConfigurationAPI(config.id, {
          name: config.name,
          value: config.value,
        });
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
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (text, record) => (
        <Input.TextArea
          value={record.value}
          onChange={(e) =>
            handleValueChange(record.id, e.target.value)
          }
          placeholder="Nhập giá trị"
          autoSize={{ minRows: 1, maxRows: 6 }}
        />
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
        className="admin-system-config-card"
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSaveAll}
          >
            Lưu tất cả
          </Button>
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
