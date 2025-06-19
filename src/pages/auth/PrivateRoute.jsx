import { useContext } from "react"
import { AuthContext } from "../../components/context/AuthContext"
import { Link } from "react-router-dom"
import { Button, Result } from "antd"

const PrivateRoute = ({ children, requiredRole }) => {
    const { user } = useContext(AuthContext)

    // Nếu chưa đăng nhập
    if (!user || !user.id) {
        return (
            <Result
                status="403"
                title="Oops!"
                subTitle="Bạn cần đăng nhập để truy cập trang này!"
                extra={
                    <Button type="primary">
                        <Link to='/login'>
                            <span>Đăng nhập</span>
                        </Link>
                    </Button>
                }
            />
        )
    }

    // Nếu có yêu cầu role và không đúng role
    if (requiredRole && user.role !== requiredRole) {
        return (
            <Result
                status="403"
                title="Không có quyền truy cập"
                subTitle="Bạn không có quyền truy cập trang này!"
                extra={
                    <Button type="primary">
                        <Link to='/'>
                            <span>Về trang chủ</span>
                        </Link>
                    </Button>
                }
            />
        )
    }

    // Nếu đã đăng nhập và có đủ quyền
    return children
}

export default PrivateRoute