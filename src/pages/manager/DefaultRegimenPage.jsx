import { useEffect, useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  Modal,
  Input,
  notification,
} from 'antd';
import UpdateRegimenModal from '../../components/doctor/UpdateRegimenModal';
import DefaultRegimenCard from '../../components/manager/DefaultRegimenCard';
import { createRegimenAPI, deleteRegimenAPI, fetchAllRegimensAPI } from '../../services/regimen.service';

const DefaultRegimenPage = () => {
  const [regimens, setRegimens] = useState([]);
  const [components, setComponents] = useState('');
  const [regimenName, setRegimenName] = useState('');
  const [description, setDescription] = useState('');
  const [indications, setIndications] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [dataUpdate, setDataUpdate] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredRegimens, setFilteredRegimens] = useState([]);

  useEffect(() => {
    loadRegimens();
  }, []);

  const loadRegimens = async () => {
    try {
      const response = await fetchAllRegimensAPI();
      const defaultRegimens = response.data.filter(r => r.doctor === null);
      setRegimens(defaultRegimens);
      setFilteredRegimens(defaultRegimens);
    } catch (error) {
      console.error('Failed to load regimens:', error);
    }
  };

  const handleCreateRegimen = async () => {
    try {
      const response = await createRegimenAPI(
        components,
        regimenName,
        description,
        indications,
        contraindications,
        null
      );

      if (response.data) {
        notification.success({ message: 'Tạo phác đồ mặc định thành công' });
        resetAndClose();
        await loadRegimens();
      }
    } catch {
      notification.error({ message: 'Lỗi tạo phác đồ' });
    }
  };

  const handleDeleteRegimen = async (id) => {
    const response = await deleteRegimenAPI(id);

    const statusCode = response.status;
    const message = response.message;

    if (response.status === 200) {
      notification.success({ message: 'Xóa phác đồ thành công' });
      await loadRegimens();
    } else if (statusCode === 409) {
      notification.warning({
        message: 'Không thể xóa phác đồ',
        description: message,
      });
    } else {
      notification.error({
        message: 'Lỗi khi xóa phác đồ',
        description: message,
      });
    }
  };

  const resetAndClose = () => {
    setRegimenName('');
    setComponents('');
    setDescription('');
    setIndications('');
    setContraindications('');
    setIsCreateModalOpen(false);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const lower = value.toLowerCase();

    const filtered = regimens.filter((item) =>
      item.regimenName.toLowerCase().includes(lower) ||
      item.components.toLowerCase().includes(lower) ||
      item.indications.toLowerCase().includes(lower) ||
      item.contraindications.toLowerCase().includes(lower) ||
      item.description.toLowerCase().includes(lower)
    );

    setFilteredRegimens(filtered);
  };

  return (
    <div style={{ padding: '10px' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <h2>Phác đồ mặc định</h2>
        </Col>
        <Col>
          <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
            Tạo mới
          </Button>
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm phác đồ"
          allowClear
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '20vw' }}
        />
      </Row>

      <Row gutter={[24, 24]}>
        {filteredRegimens.map((regimen) => (
          <Col key={regimen.id} xs={24} sm={12} md={8}>
            <DefaultRegimenCard
              regimen={regimen}
              onEdit={(data) => {
                setDataUpdate(data);
                setIsUpdateModalOpen(true);
              }}
              onDelete={handleDeleteRegimen}
            />
          </Col>
        ))}
      </Row>

      <Modal
        title="Tạo phác đồ mặc định"
        open={isCreateModalOpen}
        onOk={handleCreateRegimen}
        onCancel={resetAndClose}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Tên phác đồ">
            <Input value={regimenName} onChange={(e) => setRegimenName(e.target.value)} />
          </Form.Item>
          <Form.Item label="Thành phần">
            <Input value={components} onChange={(e) => setComponents(e.target.value)} />
          </Form.Item>
          <Form.Item label="Mô tả">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Form.Item>
          <Form.Item label="Chỉ định">
            <Input value={indications} onChange={(e) => setIndications(e.target.value)} />
          </Form.Item>
          <Form.Item label="Chống chỉ định">
            <Input value={contraindications} onChange={(e) => setContraindications(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <UpdateRegimenModal
        isUpdateRegimenModalOpen={isUpdateModalOpen}
        setIsUpdateRegimenModalOpen={setIsUpdateModalOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadRegimens={loadRegimens}
      />
    </div>
  );
};

export default DefaultRegimenPage;
