import axios from './axios.customize'

const loginAPI = (username, password) => {
    const URL_BACKEND = '/api/auth/login'
    const data = {
        username: username,
        password: password,
    }
    return axios.post(URL_BACKEND, data)
}

const googleLoginAPI = (data) => {
    const URL_BACKEND = '/api/auth/google'
    return axios.post(URL_BACKEND, data)
}


const fetchAccountAPI = () => {
    const URL_BACKEND = '/api/auth/account'
    return axios.get(URL_BACKEND)
}


const registerAPI = (values) => {
    const URL_BACKEND = '/api/auth/register'
    const data = {
        fullName: values.fullname,
        gender: values.gender,
        dateOfBirth: values.dob.format('YYYY-MM-DD'),
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        username: values.username,
        password: values.newPassword
    }
    return axios.post(URL_BACKEND, data)
}

const resetPasswordAPI = (newPassword, token) => {
    const URL_BACKEND = `/api/auth/reset-password`
    const data = {
        token: token,
        password: newPassword
    }
    return axios.put(URL_BACKEND, data)
}

const sendResetPasswordAPI = (email) => {
    const URL_BACKEND = `/api/auth/reset-password`
    const data = {
        email: email
    }
    return axios.post(URL_BACKEND, data)
}

const resendVerifyEmailAPI = (email) => {
    const URL_BACKEND = `/api/auth/resend-email`
    const data = {
        email: email
    }
    return axios.post(URL_BACKEND, data)
}

const verifyEmailAPI = (token) => {
    const URL_BACKEND = `/api/auth/verify?token=${token}`
    return axios.get(URL_BACKEND)
}


const logoutAPI = () => {
    const URL_BACKEND = '/api/auth/logout'
    return axios.post(URL_BACKEND)
}

export {
    loginAPI,
    googleLoginAPI,
    fetchAccountAPI,
    registerAPI,
    resetPasswordAPI,
    sendResetPasswordAPI,
    logoutAPI,
    resendVerifyEmailAPI,
    verifyEmailAPI
}