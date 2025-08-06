import {
  useState,
  useEffect
} from 'react';
import {
  Link
} from 'react-router-dom';
import {
  Spin,
  message,
  Modal
} from 'antd';
import {
  fetchAllDocumentsAPI,
  getDocumentImagesByDocumentId
} from '../../services/document.service';
import {
  FileImageOutlined
} from '@ant-design/icons';
import '../../styles/home-section/DocumentList.css';

const Document = () => {
  const [documents, setDocuments] = useState([]);
  const [showAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [documentImages, setDocumentImages] = useState({});

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetchAllDocumentsAPI();
        if (response && response.data) {
          setDocuments(response.data);
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
          .catch((error) => console.error('Lỗi tải dữ liệu local:', error));
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const visibleDocuments = showAll ? documents : shuffleArray(documents).slice(0, 4);

  const showModal = (doc) => {
    setSelectedDoc(doc);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };



  // Display a small brief 70% information of the document
  const getSnippet = (html, maxLength = 70) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
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
                    {getSnippet(doc.content, 70)}
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
              )
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
            <div
              className="document-content"
              dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
            />
          </div>
        )}
      </Modal>
    </section>
  )
}
export default Document
