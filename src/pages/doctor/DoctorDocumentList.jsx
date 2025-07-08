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
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { EyeOutlined } from '@ant-design/icons';
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
  const [imageList, setImageList] = useState([]); // {id, image} hoặc chỉ image nếu chưa lưu
  const [newImage, setNewImage] = useState('');
  const searchRef = useRef();
  const debounceTimeout = useRef();
  const [allDocuments, setAllDocuments] = useState([]); // lưu toàn bộ documents để filter
  const fileInputRef = useRef();
  const [previewImage, setPreviewImage] = useState(null);
  const handlePreview = (imgSrc) => setPreviewImage(imgSrc);

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
    setImageList([]);
    setModalOpen(true);
  };

  const openEditModal = async (doc) => {
    form.setFieldsValue({ title: doc.title, content: doc.content });
    setEditId(doc.id);
    setModalOpen(true);
    // Load ảnh hiện tại
    try {
      const res = await getDocumentImagesByDocumentId(doc.id);
      setImageList(res.data.map(img => ({ id: img.id, image: img.image })));
    } catch {
      setImageList([]);
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

  // Thêm ảnh từ file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (!imageList.some(img => img.image === base64)) {
        setImageList([...imageList, { image: base64 }]);
      } else {
        message.warning('Ảnh này đã tồn tại trong danh sách!');
      }
    };
    reader.readAsDataURL(file);
    // Reset input để chọn lại cùng file nếu muốn
    e.target.value = '';
  };

  // Thêm ảnh từ clipboard (paste)
  const handlePaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result;
          if (!imageList.some(img => img.image === base64)) {
            setImageList(prev => [...prev, { image: base64 }]);
            message.success('Đã dán ảnh từ clipboard!');
          } else {
            message.warning('Ảnh này đã tồn tại trong danh sách!');
          }
        };
        reader.readAsDataURL(file);
        break; // chỉ lấy ảnh đầu tiên
      }
    }
  };

  // Xử lý xóa url ảnh khỏi danh sách tạm (nếu là ảnh đã lưu thì xóa ở backend luôn)
  const handleRemoveImage = async (img) => {
    if (img.id) {
      // Ảnh đã lưu, xóa ở backend
      try {
        await deleteDocumentImage(img.id);
        setImageList(imageList.filter(i => i.image !== img.image));
        message.success('Đã xóa ảnh');
      } catch {
        message.error('Lỗi khi xóa ảnh');
      }
    } else {
      // Ảnh mới thêm, chỉ xóa ở frontend
      setImageList(imageList.filter(i => i.image !== img.image));
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
      // Xử lý ảnh: thêm mới các ảnh chưa có id
      for (const img of imageList) {
        if (!img.id && documentId) {
          await createDocumentImage({ image: img.image, documentId });
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
        <div
          style={{ marginTop: 16 }}
          tabIndex={0}
          onPaste={handlePaste}
        >
          <div style={{ fontWeight: 500, marginBottom: 8 }}><PictureOutlined /> Ảnh tài liệu</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
            Bạn có thể <b>dán ảnh (Ctrl+V)</b> hoặc chọn file ảnh từ máy tính.
          </div>
          <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current.click()}>
            Chọn file ảnh
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <List
            dataSource={imageList}
            renderItem={img => (
              <List.Item
                actions={[
                  <Button
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handlePreview(img.image)}
                  >
                    Xem
                  </Button>,
                  <Button danger size="small" onClick={() => handleRemoveImage(img)}>Xóa</Button>
                ]}
              >
                <img
                  src={img.image}
                  alt="document"
                  style={{ maxHeight: 40, marginRight: 8, cursor: 'pointer', border: '1px solid #eee', borderRadius: 4 }}
                  onClick={() => handlePreview(img.image)}
                />
              </List.Item>
            )}
            locale={{ emptyText: 'Chưa có ảnh nào' }}
            style={{ marginTop: 8 }}
          />
          <Modal
            open={!!previewImage}
            footer={null}
            onCancel={() => setPreviewImage(null)}
            width={500}
            centered
          >
            <img src={previewImage} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
          </Modal>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorDocumentList; 