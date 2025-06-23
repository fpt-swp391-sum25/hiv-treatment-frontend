import React, { useState } from 'react';
import { Card, Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import '../../styles/doctor/PersonalInfo.css';

const DoctorPersonalProfile = ({ doctorData }) => {
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
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="personal-info-container">
      {/* Toast Notification */}
      <ToastContainer 
        position="top-end" 
        className="p-3" 
        style={{ zIndex: 1000 }}
      >
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          bg="success"
          delay={3000}
          autohide
        >
          <Toast.Header closeButton={true}>
            <FaCheckCircle className="me-2 text-success" />
            <strong className="me-auto">Thành công</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Cập nhật thông tin bác sĩ thành công!
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Trình độ chuyên môn */}
      <div className="qualification-card">
        <div className="card-header">
          <h3 className="card-title">Trình độ chuyên môn</h3>
          {!isEditing ? (
            <Button 
              variant="outline-primary" 
              onClick={handleEdit}
              className="edit-button"
              size="sm"
            >
              <FaEdit /> Sửa
            </Button>
          ) : (
            <div className="edit-actions">
              <Button 
                variant="success" 
                onClick={handleUpdate} 
                className="me-2"
                size="sm"
              >
                <FaSave /> Cập nhật
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={handleCancel}
                size="sm"
              >
                <FaTimes /> Hủy
              </Button>
            </div>
          )}
        </div>
        <div className="card-content">
          <div className="info-row">
            <div className="info-label">Bằng cấp:</div>
            {isEditing ? (
              <Form.Control
                type="text"
                value={editedData.degree}
                onChange={(e) => handleChange('degree', e.target.value)}
                className="edit-input"
              />
            ) : (
              <div className="info-value">• {doctorData.degree}</div>
            )}
          </div>
          
          <div className="info-row">
            <div className="info-label">Kinh nghiệm:</div>
            {isEditing ? (
              <Form.Control
                type="number"
                value={editedData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                className="edit-input"
                style={{ width: '100px' }}
              />
            ) : (
              <div className="info-value">• {doctorData.experience} năm</div>
            )}
          </div>
          
          <div className="info-row">
            <div className="info-label">Chứng chỉ:</div>
            <div className="certificates-container">
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
                <div className="info-value">
                  {doctorData.certificates.map((cert, index) => (
                    <div key={index} className="certificate-item">{cert}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Giới thiệu */}
      <div className="bio-card">
        <div className="card-header">
          <h3 className="card-title">Giới thiệu</h3>
        </div>
        <div className="card-content">
          {isEditing ? (
            <Form.Control
              as="textarea"
              rows={4}
              value={editedData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              className="edit-input"
            />
          ) : (
            <p className="bio-text">{doctorData.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPersonalProfile;