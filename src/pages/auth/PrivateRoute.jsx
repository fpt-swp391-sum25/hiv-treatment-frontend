import { 
    useContext
} from 'react'
import { 
    Navigate 
} from 'react-router-dom'
import { 
    Button, 
    Result 
} from 'antd'
import { 
    AuthContext 
} from '../../components/context/AuthContext'

const PrivateRoute = ({ children, requiredRole }) => {
    const { user } = useContext(AuthContext)

    if (!user.id && !localStorage.getItem('access_token')) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && !requiredRole.includes(user.role)) {
        return (
            <Result
                status="403"
                title="Không có quyền truy cập"
                subTitle="Bạn không có quyền truy cập trang này!"
                extra={
                    <Button type="primary">
                        <a href="/">Về trang chủ</a>
                    </Button>
                }
            />
        )
    }
    return children
}
export default PrivateRoute