import { useContext, useEffect, useState } from 'react';
import { Form, Row, Col, Tag, Button, notification, Modal, Input } from 'antd';
import { fetchRegimensByDoctorIdAPI, createRegimenAPI, deleteRegimenAPI } from '../../services/api.service';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import RegimenCard from '../../components/doctor/RegimenCard';
import UpdateRegimenModal from '../../components/doctor/UpdateRegimenModal';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../../components/context/AuthContext';

const RegimenList = () => {
  const [regimens, setRegimens] = useState([]);
  const [components, setComponents] = useState('')
  const [regimenName, setReginmenName] = useState('')
  const [description, setDescription] = useState('')
  const [indications, setIndications] = useState('')
  const [contraindications, setContradications] = useState('')
  const [dataUpdate, setDataUpdate] = useState('')
  const [isCreateRegimenModalOpen, setIsCreateRegimenModalOpen] = useState(false)
  const [isUpdateRegimenModalOpen, setIsUpdateRegimenModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('');
  const [filteredRegimens, setFilteredRegimens] = useState([]);

  const { user } = useContext(AuthContext);

  const navigate = useNavigate()

  useEffect(() => {
    loadRegimens();
  }, []);

  const loadRegimens = async () => {
    try {
      const response = await fetchRegimensByDoctorIdAPI(user.id);
      setRegimens(response.data);
      setFilteredRegimens(response.data);
    } catch (error) {
      console.error('Failed to load regimens:', error);
    }
  };

  const handleCreateRegimen = async (components, regimenName, description, indications, contraindications) => {
    const response = await createRegimenAPI(components, regimenName,
      description, indications, contraindications, user.id)

    if (response.data) {
      notification.success({
        message: 'Hệ thống',
        showProgress: true,
        pauseOnHover: true,
        description: 'Tạo mới phác đồ thành công'
      })
    } else {
      notification.error({
        message: 'Hệ thống',
        showProgress: true,
        pauseOnHover: true,
        description: 'Lỗi xảy ra trong quá trình tạo phác đồ'
      })
    }
    resetAndClose()
    await loadRegimens()
  }

  const handleDeleteRegimen = async (id) => {
    try {
      const response = await deleteRegimenAPI(id);

      if (response.status === 200) {
        notification.success({
          message: 'Hệ thống',
          description: 'Xóa phác đồ thành công',
        });
        await loadRegimens();
      } else if (response.status === 409) {
        notification.warning({
          message: 'Không thể xóa phác đồ',
          description: response.message || 'Phác đồ đang được sử dụng',
        });
      } else {
        notification.error({
          message: 'Lỗi khi xóa phác đồ',
          description: response.message || 'Đã xảy ra lỗi không xác định',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi khi xóa phác đồ',
        description: error?.response?.data?.message || 'Lỗi kết nối tới máy chủ',
      });
    }
  };


  const resetAndClose = () => {
    setReginmenName('')
    setComponents('')
    setDescription('')
    setIndications('')
    setContradications('')
    setIsCreateRegimenModalOpen(false)
  }

  const handleSearch = (value) => {
    setSearchText(value);
    const lowerCaseValue = value.toLowerCase();

    const filtered = regimens.filter((item) =>
      item.regimenName.toLowerCase().includes(lowerCaseValue) ||
      item.components.toLowerCase().includes(lowerCaseValue) ||
      item.indications.toLowerCase().includes(lowerCaseValue) ||
      item.contraindications.toLowerCase().includes(lowerCaseValue) ||
      item.description.toLowerCase().includes(lowerCaseValue)
    );

    setFilteredRegimens(filtered);
  };

  return (
    <div style={{ padding: '10px' }}>
      <Row justify="space-between" align="middle">
        <Col style={{ margin: '0 0 0 1vw' }}>
          <h2>Danh sách phác đồ</h2>
        </Col>
        {/* Create regimen button */}
        <Col style={{ margin: '0 0 10px 0' }}>
          <Button style={{ width: '5vw' }}
            onClick={() => setIsCreateRegimenModalOpen(true)} type='primary'>Tạo mới</Button>
        </Col>
      </Row>

      {/* Search regimen  */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Input
          allowClear
          placeholder="Tìm kiếm phác đồ"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '20vw', marginRight: '1vw' }}
        />
      </Row>

      {/* Display regimen */}
      <Row gutter={[24, 24]}>
        {filteredRegimens.map((regimen) => (
          <Col key={regimen.id} xs={24} sm={12} md={8}>
            <RegimenCard
              regimen={regimen}
              onEdit={(data) => {
                setIsUpdateRegimenModalOpen(true)
                setDataUpdate(data)
              }}
              onDelete={(id) => handleDeleteRegimen(id)}
            />
          </Col>
        ))}
      </Row>

      {/* Create regimen modal */}
      <Modal
        title='Tạo mới phác đồ điều trị'
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isCreateRegimenModalOpen}
        onOk={() => handleCreateRegimen(
          components,
          regimenName,
          description,
          indications,
          contraindications,
        )}
        onCancel={resetAndClose}
        okText={'Tạo'}
        cancelText={'Hủy'}>
        <Form>
          <Form.Item label='Tên phác đồ'>
            <Input value={regimenName} onChange={(event) => setReginmenName(event.target.value)} />
          </Form.Item>
          <Form.Item label='Thành phần phác đồ'>
            <Input value={components} onChange={(event) => setComponents(event.target.value)} />
          </Form.Item>
          <Form.Item label='Mô tả'>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </Form.Item>
          <Form.Item label='Chỉ định'>
            <Input value={indications} onChange={(event) => setIndications(event.target.value)} />
          </Form.Item>
          <Form.Item label='Chống chỉ định'>
            <Input value={contraindications} onChange={(event) => setContradications(event.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <UpdateRegimenModal
        isUpdateRegimenModalOpen={isUpdateRegimenModalOpen}
        setIsUpdateRegimenModalOpen={setIsUpdateRegimenModalOpen}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        loadRegimens={loadRegimens}
        user={user}
      />
    </div>
  )
}
export default RegimenList;
