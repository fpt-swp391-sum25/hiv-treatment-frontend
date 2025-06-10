import React, { useState, useEffect } from 'react';
import './resource-search-page.css';

const ResourceSearchPage = () => {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocs, setFilteredDocs] = useState([]);

  useEffect(() => {
    fetch('/api/documents.json')
      .then((res) => res.json())
      .then((data) => {
        setDocuments(data);
        setFilteredDocs(data);
      })
      .catch((err) => console.error('Lỗi tải dữ liệu:', err));
  }, []);
  const handleSearch = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);

    // Chuyển đổi cả input và dữ liệu thành chữ thường để tìm kiếm
    const term = inputValue.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(term) ||
        doc.author.toLowerCase().includes(term) ||
        doc.content.toLowerCase().includes(term)
    );

    setFilteredDocs(filtered);
  };
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const visibleDocs = showAll ? filteredDocs : filteredDocs.slice(0, 8);

  return (
    <section className="resource-page">
      <input
        type="text"
        placeholder="Tìm kiếm theo tiêu đề, tác giả hoặc nội dung..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />      <div className="document-grid">
        {visibleDocs.map((doc) => (
          <div className="document-card" key={doc.id}>
            <h3 className="doc-title">
              {doc.title.length > 60 ? doc.title.slice(0, 60) + '...' : doc.title}
            </h3>
            <p className="document-author">👨‍⚕️ {doc.author}</p>
            <p className="document-snippet">
              {doc.content.length > 70 ? doc.content.slice(0, 70) + '...' : doc.content}
            </p>
            <p className="document-date">
              📅 {new Date(doc.created_at).toLocaleDateString('vi-VN')}
            </p>
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

      {filteredDocs.length > 8 && (
        <div className="view-all-container">
          <button className="btn-outline" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Thu gọn danh sách' : 'Xem tất cả tài liệu'}
          </button>
        </div>
      )}
    </section>
  );
};

export default ResourceSearchPage;
