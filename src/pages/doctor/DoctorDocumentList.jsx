import { 
  useEffect, 
  useState, 
  useContext, 
  useRef 
} from 'react'
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  createDocumentImage,
  deleteDocumentImage,
  getDocumentImagesByDocumentId,
} from '../../services/document.service'
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
} from 'antd'
import { 
  CKEditor 
} from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  PictureOutlined, 
  UploadOutlined,
  EyeOutlined 
} from '@ant-design/icons'
import { AuthContext } from '../../components/context/AuthContext'
import dayjs from 'dayjs'

const DoctorDocumentList = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editId, setEditId] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const { user } = useContext(AuthContext)
  const [imageList, setImageList] = useState([])
  const [allDocuments, setAllDocuments] = useState([])
  const fileInputRef = useRef()
  const [previewImage, setPreviewImage] = useState(null)
  const handlePreview = (imgSrc) => setPreviewImage(imgSrc)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const res = await getAllDocuments()
      const myDocs = (res.data || []).filter(doc => doc.doctor?.id === user?.id)
      // Sort from newest to oldest by creation date
      const sortedDocs = myDocs.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA // newest first
      })
      setDocuments(sortedDocs)
      setAllDocuments(sortedDocs)
    } catch {
      message.error('Error loading document list')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  // Filtered data when search, no call API
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    if (!value || value.trim() === '') {
      setDocuments(allDocuments)
    } else {
      const term = value.toLowerCase()
      const filtered = allDocuments.filter(doc =>
        (doc.title && doc.title.toLowerCase().includes(term)) ||
        (doc.doctor && doc.doctor.fullName && doc.doctor.fullName.toLowerCase().includes(term))
      )
      // Maintain sort order from newest to oldest when searching
      const sortedFiltered = filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0)
        const dateB = new Date(b.createdAt || 0)
        return dateB - dateA // newest first
      })
      setDocuments(sortedFiltered)
    }
  }

  const openCreateModal = () => {
    form.resetFields()
    setEditId(null)
    setImageList([])
    setModalOpen(true)
  }

  const openEditModal = async (doc) => {
    form.setFieldsValue({ title: doc.title, content: doc.content })
    setEditId(doc.id)
    setModalOpen(true)
    try {
      const res = await getDocumentImagesByDocumentId(doc.id)
      setImageList(res.data.map(img => ({ id: img.id, image: img.image })))
    } catch {
      setImageList([])
    }
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
        // Lấy danh sách ảnh liên quan
      const images = await getDocumentImagesByDocumentId(id);

        // Xóa từng ảnh
      for (const image of images.data) {
        await deleteDocumentImage(image.id);
      }
        // Xóa document
      await deleteDocument(id)
      message.success('Xóa document thành công')
      fetchDocuments()
    } catch {
      message.error('Lỗi khi xóa document')
    }
    setLoading(false)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result
      if (!imageList.some(img => img.image === base64)) {
        setImageList([...imageList, { image: base64 }])
      } else {
        message.warning('This image already exists in the list!')
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Add image from clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result
                  if (!imageList.some(img => img.image === base64)) {
          setImageList(prev => [...prev, { image: base64 }])
          message.success('Image pasted from clipboard!')
        } else {
          message.warning('This image already exists in the list!')
        }
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }

  const handleRemoveImage = async (img) => {
    if (img.id) {
      // Delete image in database
      try {
        await deleteDocumentImage(img.id)
        setImageList(imageList.filter(i => i.image !== img.image))
        message.success('Đã xóa ảnh')
      } catch {
        message.error('Lỗi khi xóa ảnh')
      }
    } else {
      // Delete image that has not been saved to database
      setImageList(imageList.filter(i => i.image !== img.image))
    }
  }

  // Function to clean HTML content from CKEditor
  const cleanHtmlContent = (htmlContent) => {
    if (!htmlContent) return ''
    
    // delete <p></p> empty or only contain whitespace
    let cleaned = htmlContent.replace(/<p>\s*<\/p>/g, '')
    
    // delete <p> and </p> if the content is only text
    // Check if it's just simple text
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = cleaned
    
    // if there is only one p tag and no other html tags
    if (tempDiv.children.length === 1 && tempDiv.children[0].tagName === 'P') {
      const pContent = tempDiv.children[0].innerHTML
      // if the content in p does not contain other html tags
      if (!/<[^>]*>/g.test(pContent)) {
        return pContent.trim()
      }
    }
    
    // delete empty <p> tags
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '')
    
    // delete <br> at the end
    cleaned = cleaned.replace(/<br\s*\/?>\s*$/g, '')
    
    return cleaned.trim()
  }

  const handleModalOk = async () => {
    try {
      setModalLoading(true)
      const values = await form.validateFields()
      
      // Clean HTML content before saving
      const cleanedValues = {
        ...values,
        content: cleanHtmlContent(values.content)
      }
      
      let documentId = editId
      if (editId) {
        await updateDocument(editId, cleanedValues)
        message.success('Document updated successfully')
      } else {
        const res = await createDocument(cleanedValues, user?.id)

        let documentId
        const match = res?.data?.message?.match(/ID:\s*(\d+)/)
        if (match && match[1]) {
          documentId = parseInt(match[1], 10)
        } else {
          throw new Error('Không thể lấy ID từ phản hồi của backend.')
        }

        for (const img of imageList) {
        if (!img.id && documentId) {
          await createDocumentImage({ image: img.image, documentId })
        }
      }
      }
      setModalOpen(false)
      fetchDocuments()
    } catch (err) {
      if (err && err.errorFields) return
      message.error('Lỗi khi lưu document hoặc ảnh')
    }
    setModalLoading(false)
  }

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
            type='primary'
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa document này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button className='custom-delete-btn' icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </>
      ),
    },
  ]

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
            <CKEditor
              editor={ClassicEditor}
              data={form.getFieldValue('content')}
              config={{
                // Cấu hình để giảm thiểu HTML không cần thiết
                enterMode: 2, // BR tags thay vì P tags
                shiftEnterMode: 1, // P tags cho Shift+Enter
                autoParagraph: false, // Không tự động tạo P tags
                fillEmptyBlocks: false, // Không fill empty blocks
                removeEmptyElements: true, // Loại bỏ elements rỗng
                // Cấu hình toolbar đơn giản hơn
                toolbar: [
                  'heading',
                  '|',
                  'bold',
                  'italic',
                  'underline',
                  'strikethrough',
                  '|',
                  'bulletedList',
                  'numberedList',
                  '|',
                  'link',
                  'blockQuote',
                  '|',
                  'undo',
                  'redo'
                ]
              }}
              onChange={(event, editor) => {
                const data = editor.getData()
                form.setFieldValue('content', data)
              }}
            />
          </Form.Item>
        </Form>
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
                  <Button className='custom-delete-btn' size="small" onClick={() => handleRemoveImage(img)}>Xóa</Button>
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
  )
}
export default DoctorDocumentList