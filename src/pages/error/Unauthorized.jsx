import { 
    Card, 
    Typography, 
    Button 
} from 'antd'
import { 
    useNavigate 
} from 'react-router-dom'

const { Title, Paragraph } = Typography

const Unauthorized = () => {
    const navigate = useNavigate()

    return (
        <div style={{ maxWidth: 600, margin: '50px auto' }}>
            <Card>
                <Title level={3}>Không có quyền truy cập</Title>
                <Paragraph>
                    Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </Paragraph>
                <Button type="primary" onClick={() => navigate('/')}>
                    Quay lại trang chủ
                </Button>
            </Card>
        </div>
    )
}
export default Unauthorized