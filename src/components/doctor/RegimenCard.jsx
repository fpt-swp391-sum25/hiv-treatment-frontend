import { 
  useState 
} from 'react';
import { 
  Card, 
  Tag, 
  Button, 
  Space, 
  Popconfirm 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';

const RegimenCard = ({ regimen, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const getTypeTag = (user) => {
    return user == null ? (
      <Tag color='blue'>Default</Tag>
    ) : (
      <Tag color='green'>Customize</Tag>
    );
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{regimen?.regimenName || 'Không tên'}</span>
          {getTypeTag(regimen.doctor)}
        </div>
      }
      hoverable
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            maxHeight: expanded ? 'none' : '170px', 
            overflow: 'hidden',
            transition: 'max-height 0.3s ease',
            position: 'relative'
          }}
        >
          <p><strong>Thành phần:</strong> {regimen?.components || 'Không có'}</p>
          <p><strong>Chỉ định:</strong> {regimen?.indications || 'Không có'}</p>
          <p><strong>Chống chỉ định:</strong> {regimen?.contraindications || 'Không có'}</p>
          <p><strong>Mô tả:</strong> {regimen?.description || 'Không có'}</p>
        </div>

        {!expanded && (
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: 0,
              right: 0,
              height: '40px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0), white)'
            }}
          />
        )}

        <div style={{ marginTop: 8 }}>
          <Button style = {{margin: '0 0 0 -1vw'}} type="link" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Thu gọn' : 'Hiển thị thêm'}
          </Button>
        </div>
      </div>

      { /* Update and delete regimen if it's not default */}
      <Space style={{ marginTop: '1vh' }}>
        {regimen.doctor && (
          <>
            <EditOutlined onClick={() => onEdit(regimen)} />
            <Popconfirm
              title='Xóa phác đồ'
              description='Bạn có chắc muốn xóa phác đồ này?'
              onConfirm={() => onDelete(regimen.id)}
              okText='Có'
              cancelText='Không'
              placement='bottom'
            >
              <DeleteOutlined style={{ color: 'red' }} />
            </Popconfirm>
          </>
        )}
      </Space>
    </Card>
  );
};
export default RegimenCard;
