import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './document.css';

const Document = () => {
  const [documents, setDocuments] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    //fetch('/api/doctors') // có data thì gỡ cmt dòng này
    fetch('/api/documents.json')
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error('Lỗi tải dữ liệu:', err));
  }, []);

  const visibleDocuments = showAll ? documents : documents.slice(0, 4);
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="document-section">
      <h2 className="document-title">
        Tài liệu về <span className="highlight">HIV</span>
      </h2>
      <p className="document-subtitle">
        Khám phá các tài liệu chuyên sâu được biên soạn bởi đội ngũ chuyên gia y tế hàng đầu.
      </p>

      <div className="document-grid">
        {visibleDocuments.map((doc) => (
          <div className="document-card" key={doc.id}>
            <h3 className="doc-title">
              {doc.title.length > 60 ? doc.title.slice(0, 60) + '...' : doc.title}
            </h3>
            <p className="document-author">👨‍⚕️ {doc.author}</p>
            <p className="document-snippet">
              {doc.content.length > 70 ? doc.content.slice(0, 70) + '...' : doc.content}
            </p>
            <p className="document-date">📅 {new Date(doc.created_at).toLocaleDateString('vi-VN')}</p>
            <button className="btn-read" onClick={() => toggleExpand(doc.id)}>
              {expandedId === doc.id ? '🔽 Thu gọn' : '📖 Đọc bài viết'}
            </button>
            {expandedId === doc.id && (
              <div className="document-full-content">
                <hr />
                <p>{doc.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {documents.length > 4 && (
        <div className="view-all-container">
          <Link to="/resources" className="btn-outline">
            Xem tất cả tài liệu
          </Link>
        </div>
      )}
    </section>
  );
};

export default Document;
