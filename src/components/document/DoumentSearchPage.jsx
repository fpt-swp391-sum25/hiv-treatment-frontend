import React, { useState, useEffect } from 'react';
import { Modal, message, Spin } from 'antd';
import { fetchAllDocumentsAPI } from '../../services/api.service';
import '../../styles/document/DocumentSearchPage.css';

const ResourceSearchPage = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetchAllDocumentsAPI();
        if (response && response.data) {
          setDocuments(response.data);
          setFilteredDocs(response.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách tài liệu:', error);
        message.error('Không thể tải danh sách tài liệu');
        // Fallback to local data if API fails
        fetch('/api/documents.json')
          .then((res) => res.json())
          .then((data) => {
            setDocuments(data);
            setFilteredDocs(data);
          })
          .catch((err) => console.error('Lỗi tải dữ liệu local:', err));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleSearch = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);

    // Chuyển đổi cả input và dữ liệu thành chữ thường để tìm kiếm
    const term = inputValue.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(term) ||
        doc.author?.toLowerCase().includes(term) ||
        doc.content?.toLowerCase().includes(term)
    );

    setFilteredDocs(filtered);
  };

  const showModal = (doc) => {
    setSelectedDoc(doc);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <section className="resource-page">
      <input
        type="text"
        placeholder="Tìm kiếm theo tiêu đề, tác giả hoặc nội dung..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải danh sách tài liệu...</p>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="document-grid">
          {filteredDocs.map((doc) => (
            <div className="document-card" key={doc.id}>
              <h3 className="doc-title">
                {doc.title.length > 60 ? doc.title.slice(0, 60) + '...' : doc.title}
              </h3>
              <p className="document-author">
                👨‍⚕️ {doc.author || 'Chưa có tác giả'}
              </p>
              <p className="document-snippet">
                {doc.content?.length > 70 ? doc.content.slice(0, 70) + '...' : doc.content}
              </p>
              <p className="document-date">
                📅 {new Date(doc.createdAt || doc.created_at).toLocaleDateString('vi-VN')}
              </p>
              <button className="btn-read" onClick={() => showModal(doc)}>
                📖 Đọc bài viết
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          Không tìm thấy tài liệu nào phù hợp.
        </div>
      )}

      <Modal
        title={selectedDoc?.title}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {selectedDoc && (
          <div className="modal-content">
            <p className="document-author">
              👨‍⚕️ {selectedDoc.author || 'Chưa có tác giả'}
            </p>
            <p className="document-date">
              📅 {new Date(selectedDoc.createdAt || selectedDoc.created_at).toLocaleDateString('vi-VN')}
            </p>
            <div className="document-content">
              {selectedDoc.content}
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default ResourceSearchPage;
