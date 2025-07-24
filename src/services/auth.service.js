import axios from './axios.customize'

const resetPasswordAPI = (newPassword, token) => {
    const URL_BACKEND = `/api/auth/reset-password`
    const data = {
        password: newPassword
    }
    return axios.put(URL_BACKEND, {
        header: {
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json',
            'Custom-header': 'value'
        }
    }, data)
}

const sendResetPasswordAPI = (email) => {
    const URL_BACKEND = `/api/auth/reset-password`
    const data = {
        email: email
    }
    return axios.post(URL_BACKEND, data)
}

export {
    resetPasswordAPI,
    sendResetPasswordAPI
}