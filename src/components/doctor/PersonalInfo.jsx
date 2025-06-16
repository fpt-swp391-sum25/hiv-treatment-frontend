import React, { useState } from 'react';
import { Card, Button, Form, Toast } from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../../styles/doctor/PersonalInfo.css';

const PersonalInfo = ({ doctorData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(doctorData);
  const [showToast, setShowToast] = useState(false);

  if (!doctorData) return null;

  const handleEdit = () => {
    setEditedData(doctorData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedData(doctorData);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    // TODO: Implement API call here
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (    <div className="personal-info-container">
      {/* Success Toast */}      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)}
        style={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 1000,
          background: '#D4EDDA',
          color: '#155724',
          borderColor: '#C3E6CB',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '300px'
        }}
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">Thông báo</strong>
        </Toast.Header>
        <Toast.Body>Cập nhật thông tin thành công!</Toast.Body>
      </Toast>

      {/* Qualifications Card */}
      <Card className="info-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="card-title mb-0">Trình độ chuyên môn</h3>
            {!isEditing ? (
              <Button 
                variant="outline-primary" 
                onClick={handleEdit}
                className="edit-button"
              >
                <FaEdit /> Sửa
              </Button>
            ) : (
              <div>
                <Button 
                  variant="success" 
                  onClick={handleUpdate} 
                  className="me-2"
                >
                  <FaSave /> Cập nhật
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCancel}
                >
                  <FaTimes /> Hủy
                </Button>
              </div>
            )}
          </div>
          <div className="qualification-details">
            <div className="info-item">
              <span className="info-label">Bằng cấp:</span>
              {isEditing ? (
                <Form.Control
                  type="text"
                  value={editedData.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span className="info-value">• {doctorData.degree}</span>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">Kinh nghiệm:</span>
              {isEditing ? (
                <Form.Control
                  type="number"
                  value={editedData.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  className="edit-input"
                  style={{ width: '100px' }}
                />
              ) : (
                <span className="info-value">• {doctorData.experience} năm</span>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">Chứng chỉ:</span>
              <div className="info-value certificates-list">
                {isEditing ? (
                  editedData.certificates.map((cert, index) => (
                    <Form.Control
                      key={index}
                      type="text"
                      value={cert}
                      onChange={(e) => {
                        const newCerts = [...editedData.certificates];
                        newCerts[index] = e.target.value;
                        handleChange('certificates', newCerts);
                      }}
                      className="edit-input mb-2"
                    />
                  ))
                ) : (
                  doctorData.certificates.map((cert, index) => (
                    <div key={index} className="certificate-item"> {cert}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>      {/* Introduction Card */}
      <Card className="info-card">
        <Card.Body>
          <h3 className="card-title">Giới thiệu</h3>
          {isEditing ? (
            <Form.Control
              as="textarea"
              rows={4}
              value={editedData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="edit-input"
            />
          ) : (
            <p className="introduction-text">{doctorData.bio}</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonalInfo;