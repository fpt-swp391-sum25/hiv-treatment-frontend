import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext({
    email: '',
    phone: '',
    fullName: '',
    role: '',
    id: '',
    phoneNumber: ''
})

export const AuthWrapper = (props) => {
    const [user, setUser] = useState({
        id: '',
        username: '',
        email: '',
        fullName: '',
        status: '',
        role: '',
        phoneNumber: ''
    })

    const [isAppLoading, setIsAppLoading] = useState(false)

    useEffect(() => {
        // Lấy user từ localStorage nếu có
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, isAppLoading, setIsAppLoading }} >
            {props.children}
        </AuthContext.Provider>
    )
}

