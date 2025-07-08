import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spin, message, Modal } from 'antd';
import { fetchAllDocumentsAPI } from '../../services/api.service';
import { getDocumentImagesByDocumentId } from '../../services/document.service';
import { FileImageOutlined } from '@ant-design/icons';
import '../../styles/home-section/DocumentList.css';

const Document = () => {
  const [documents, setDocuments] = useState([]);
  const [showAll] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [documentImages, setDocumentImages] = useState({}); // { [documentId]: [array of images] }

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetchAllDocumentsAPI();
        if (response && response.data) {
          setDocuments(response.data);
          // Lấy ảnh cho từng document
          const imagesMap = {};
          await Promise.all(
            response.data.map(async (doc) => {
              try {
                const imgRes = await getDocumentImagesByDocumentId(doc.id);
                imagesMap[doc.id] = imgRes.data;
              } catch {
                imagesMap[doc.id] = [];
              }
            })
          );
          setDocumentImages(imagesMap);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách tài liệu:', error);
        message.error('Không thể tải danh sách tài liệu');
        // Fallback to local data if API fails
        fetch('/api/documents.json')
          .then((res) => res.json())
          .then((data) => setDocuments(data))
          .catch((err) => console.error('Lỗi tải dữ liệu local:', err));
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Chỉ hiện thị 4 tài liệu đầu tiên nếu không ở chế độ xem tất cả
  const visibleDocuments = showAll ? documents : documents.slice(0, 4);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const showModal = (doc) => {
    setSelectedDoc(doc);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <section className="document-section" id="document-section">
      <h2 className="document-title">
        Tài liệu về <span className="highlight">HIV</span>
      </h2>
      <p className="document-subtitle">
        Khám phá các tài liệu chuyên sâu được biên soạn bởi đội ngũ chuyên gia y tế hàng đầu.
      </p>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải danh sách tài liệu...</p>
        </div>
      ) : documents.length > 0 ? (
        <>
          <div className="document-grid">
            {visibleDocuments.map((doc) => {
              const imgs = documentImages[doc.id] || [];
              return (
                <div className="document-card" key={doc.id}>
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    {imgs.length > 0 ? (
                      <img src={imgs[0].image} alt="doc" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <FileImageOutlined style={{ fontSize: 48, color: '#ccc' }} />
                    )}
                  </div>
                  <h3 className="doc-title">
                    {doc.title.length > 60 ? doc.title.slice(0, 60) + '...' : doc.title}
                  </h3>
                  <p className="document-author">
                    👨‍⚕️ {doc.doctor?.fullName || 'Chưa có tác giả'}
                  </p>
                  <p className="document-snippet">
                    {doc.content?.length > 70 ? doc.content.slice(0, 70) + '...' : doc.content}
                  </p>
                  <p className="document-date">
                    📅 {new Date(doc.createdAt || doc.created_at).toLocaleDateString('vi-VN')}
                  </p>
                  <button
                    className="btn-read"
                    onClick={() => showModal(doc)}
                  >
                    📖 Đọc bài viết
                  </button>
                </div>
              );
            })}
          </div>

          {documents.length > 4 && !showAll && (
            <div className="view-all-container">
              <Link
                to="/resources"
                className="btn-outline"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Xem tất cả tài liệu
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="no-results">Không có tài liệu nào.</div>
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
            {/* Hiển thị hình ảnh của document nếu có */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {(documentImages[selectedDoc.id] && documentImages[selectedDoc.id].length > 0) ? (
                documentImages[selectedDoc.id].map(img => (
                  <img
                    key={img.id || img.image}
                    src={img.image}
                    alt="doc-img"
                    style={{ maxHeight: 120, borderRadius: 6, objectFit: 'cover', boxShadow: '0 2px 8px #0001' }}
                  />
                ))
              ) : null}
            </div>
            <p className="document-author">
              👨‍⚕️ {selectedDoc.doctor?.fullName || 'Chưa có tác giả'}
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

export default Document;
