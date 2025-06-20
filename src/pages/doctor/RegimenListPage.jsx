import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { fetchRegimensByDoctorIdAPI, fetchAllRegimensAPI } from '../../services/api.service'; 

const RegimenListPage = () => {
  const [regimens, setRegimens] = useState([]);

  useEffect(() => {
    loadRegimens();
  }, []);

  const loadRegimens = async () => {
    try {
      const response = await fetchAllRegimensAPI(); 
      setRegimens(response.data);
    } catch (error) {
      console.error('Failed to load regimens:', error);
    }
  };

  const getTypeTag = (user) => {
    return user == null ? (
      <Tag color="blue">Default</Tag>
    ) : (
      <Tag color="green">Customize</Tag>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>Danh sách phác đồ</h2>
      <Row gutter={[24, 24]}>
        {regimens.map((regimen) => (
          <Col key={regimen.id} xs={24} sm={12} md={8}>
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{regimen.regimenName || 'Không tên'}</span>
                    {getTypeTag(regimen.user)}
                    </div>
                }
                hoverable
                >
                <p><strong>Thành phần:</strong> {regimen.components || 'Không có'}</p>
                <p><strong>Chỉ định:</strong> {regimen.indications || 'Không có'}</p>
                <p><strong>Chống chỉ định:</strong> {regimen.contradications || 'Không có'}</p>
                <p><strong>Mô tả:</strong> {regimen.description || 'Không có'}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RegimenListPage;
