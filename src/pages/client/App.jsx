import { Outlet } from "react-router-dom"
import AppFooter from "../../components/layouts/client/app-footer"
import AppHeader from "../../components/layouts/client/app-header"
import { fetchAccountAPI } from "../../services/api.service"
import { useContext, useEffect } from "react"
import { AuthContext } from "../../components/context/auth.context"
import { Layout, Spin } from "antd"

const App = () => {

    const { setUser, isAppLoading, setIsAppLoading } = useContext(AuthContext)

    useEffect(() => {
        fetchUserInfo()
    }, [])

    const fetchUserInfo = async () => {
        try {
            const response = await fetchAccountAPI()
            if (response.data) {
                setUser(response.data)
                setIsAppLoading(false)
            }
        } catch (error) {
            if (error.response?.status === 401 && error.response?.data?.message === 'JWT token has expired') {
                localStorage.removeItem('token');
                message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.")
            }
        }
    }

    return (
        <>
            {isAppLoading ?
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}>
                    < Spin />
                </div>

                :
                <>
                    <Layout>
                        <AppHeader />
                        <Outlet />
                        <AppFooter />
                    </Layout>

                </>

            }

        </>
    )
}

export default App