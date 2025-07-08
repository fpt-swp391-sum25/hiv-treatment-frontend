import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  searchDocuments,
  createDocumentImage,
  deleteDocumentImage,
  getDocumentImagesByDocumentId,
} from '../../services/document.service';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Spin,
  List,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PictureOutlined } from '@ant-design/icons';
import { AuthContext } from '../../components/context/AuthContext';
import dayjs from 'dayjs';

const DoctorDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { user } = useContext(AuthContext);
  // State cho hình ảnh
  const [imageUrls, setImageUrls] = useState([]); // {id, url} hoặc chỉ url nếu chưa lưu
  const [newImageUrl, setNewImageUrl] = useState('');
  const searchRef = useRef();
  const debounceTimeout = useRef();
  const [allDocuments, setAllDocuments] = useState([]); // lưu toàn bộ documents để filter

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await getAllDocuments();
      setDocuments(res.data);
      setAllDocuments(res.data);
    } catch (err) {
      message.error('Lỗi khi tải danh sách document');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Lọc realtime khi nhập search (không gọi API search)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value || value.trim() === '') {
      setDocuments(allDocuments);
    } else {
      const term = value.toLowerCase();
      const filtered = allDocuments.filter(doc =>
        (doc.title && doc.title.toLowerCase().includes(term)) ||
        (doc.doctor && doc.doctor.fullName && doc.doctor.fullName.toLowerCase().includes(term))
      );
      setDocuments(filtered);
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setEditId(null);
    setImageUrls([]);
    setModalOpen(true);
  };

  const openEditModal = async (doc) => {
    form.setFieldsValue({ title: doc.title, content: doc.content });
    setEditId(doc.id);
    setModalOpen(true);
    // Load ảnh hiện tại
    try {
      const res = await getDocumentImagesByDocumentId(doc.id);
      setImageUrls(res.data.map(img => ({ id: img.id, url: img.url })));
    } catch {
      setImageUrls([]);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteDocument(id);
      message.success('Xóa document thành công');
      fetchDocuments();
    } catch (err) {
      message.error('Lỗi khi xóa document');
    }
    setLoading(false);
  };

  // Xử lý thêm url ảnh vào danh sách tạm
  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && !imageUrls.some(img => img.url === newImageUrl.trim())) {
      setImageUrls([...imageUrls, { url: newImageUrl.trim() }]);
      setNewImageUrl('');
    }
  };

  // Xử lý xóa url ảnh khỏi danh sách tạm (nếu là ảnh đã lưu thì xóa ở backend luôn)
  const handleRemoveImageUrl = async (img) => {
    if (img.id) {
      // Ảnh đã lưu, xóa ở backend
      try {
        await deleteDocumentImage(img.id);
        setImageUrls(imageUrls.filter(i => i.url !== img.url));
        message.success('Đã xóa ảnh');
      } catch {
        message.error('Lỗi khi xóa ảnh');
      }
    } else {
      // Ảnh mới thêm, chỉ xóa ở frontend
      setImageUrls(imageUrls.filter(i => i.url !== img.url));
    }
  };

  const handleModalOk = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();
      let documentId = editId;
      if (editId) {
        await updateDocument(editId, values);
        message.success('Cập nhật document thành công');
      } else {
        // Tạo document trước
        const res = await createDocument(values, user?.id);
        documentId = res.data?.id || null;
        message.success('Tạo mới document thành công');
        // Nếu backend không trả về id, cần reload danh sách và lấy id mới nhất
        if (!documentId) {
          await fetchDocuments();
          const latest = documents[0];
          documentId = latest?.id;
        }
      }
      // Xử lý ảnh: thêm mới các url chưa có id
      for (const img of imageUrls) {
        if (!img.id && documentId) {
          await createDocumentImage({ url: img.url, documentId });
        }
      }
      setModalOpen(false);
      fetchDocuments();
    } catch (err) {
      if (err && err.errorFields) return; // validation error
      message.error('Lỗi khi lưu document hoặc ảnh');
    }
    setModalLoading(false);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (text, record, idx) => idx + 1,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text) => text ? dayjs(text).format('DD-MM-YYYY') : '-',
    },
    {
      title: 'Tác giả',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
      width: 160,
      render: (text, record) => record.doctor?.fullName || '-',
    },
    {
      title: '',
      key: 'action',
      width: 160,
      render: (text, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            style={{ marginRight: 8 }}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa document này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Quản lý Document</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm document theo tiêu đề hoặc tác giả..."
          allowClear
          prefix={<SearchOutlined />}
          value={search}
          onChange={handleSearchChange}
          style={{ maxWidth: 320 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Tạo mới
        </Button>
      </div>
      <Spin spinning={loading} tip="Đang tải...">
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          bordered
          locale={{ emptyText: 'Không tìm thấy document nào phù hợp.' }}
        />
      </Spin>
      <Modal
        title={editId ? 'Sửa Document' : 'Tạo mới Document'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        okText={editId ? 'Lưu' : 'Tạo mới'}
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ title: '', content: '' }}
        >
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>
          <Form.Item
            label="Nội dung"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <Input.TextArea rows={5} placeholder="Nhập nội dung" />
          </Form.Item>
        </Form>
        {/* Quản lý hình ảnh */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}><PictureOutlined /> Ảnh tài liệu</div>
          <Input.Group compact>
            <Input
              style={{ width: 'calc(100% - 90px)' }}
              placeholder="Nhập url ảnh..."
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              onPressEnter={handleAddImageUrl}
            />
            <Button type="primary" onClick={handleAddImageUrl}>Thêm ảnh</Button>
          </Input.Group>
          <List
            dataSource={imageUrls}
            renderItem={img => (
              <List.Item
                actions={[
                  <Button danger size="small" onClick={() => handleRemoveImageUrl(img)}>Xóa</Button>
                ]}
              >
                <img src={img.url} alt="document" style={{ maxHeight: 40, marginRight: 8 }} />
                <span>{img.url}</span>
              </List.Item>
            )}
            locale={{ emptyText: 'Chưa có ảnh nào' }}
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DoctorDocumentList; 