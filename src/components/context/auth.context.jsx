import { createContext, useState } from 'react'

export const AuthContext = createContext({
    email: '',
    phone: '',
    fullName: '',
    role: '',
    id: ''
})

export const AuthWrapper = (props) => {
    const [user, setUser] = useState({
        id: '',
        username: '',
        email: '',
        fullName: '',
        status: '',
        role: ''
    })


    const [isAppLoading, setIsAppLoading] = useState(false)

    return (
        <AuthContext.Provider value={{ user, setUser, isAppLoading, setIsAppLoading }} >
            {props.children}
        </AuthContext.Provider>
    )
}

