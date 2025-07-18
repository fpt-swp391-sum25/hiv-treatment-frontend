
import { createContext, useEffect, useState } from 'react'
import { fetchAccountAPI, fetchUserInfoAPI } from '../../services/api.service'

export const AuthContext = createContext({
    email: '',
    phone: '',
    fullName: '',
    role: '',
    id: '',
    phoneNumber: '',
    avatar: null
})

export const AuthWrapper = (props) => {
    const [user, setUser] = useState({})


    const [authUser, setAuthUser] = useState({})


    const [isAppLoading, setIsAppLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchAccountAPI()
                .then((res) => {
                    setUser(res.data);
                })
                .catch(() => {
                    localStorage.removeItem('access_token');
                    setUser({});
                })
                .finally(() => {
                    setIsAppLoading(false);
                });
        } else {
            setIsAppLoading(false);
        }
    }, []);


    useEffect(() => {
        // Lấy user từ localStorage nếu có
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isAppLoading, setIsAppLoading, authUser, setAuthUser }} >
            {props.children}
        </AuthContext.Provider>
    )
}

