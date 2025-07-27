import axios from './axios.customize'

const bookingAPI = (values) => {
    const URL_BACKEND = `/api/schedule/`
    const data = {
        name: values.name,
        phone: values.phone,
        service: values.type,
        doctor: values.doctor,
        date: values.date.format('DD-MM-YYYY'),
        slot: values.time,
    }
    return axios.post(URL_BACKEND, data)
}

const cancelBookingAPI = (scheduleId, patientId) => {
    const URL_BACKEND = `/api/schedule/${scheduleId}/cancel`

    return axios.delete(URL_BACKEND, {
        params: { patientId: patientId.toString() },
    })
}

const initiatePaymentAPI = (params) => {
    const URL_BACKEND = '/api/payment'
    return axios.post(URL_BACKEND, params)
}

const retryPaymentAPI = (params) => {
    const URL_BACKEND = '/api/payment/retry'
    return axios.post(URL_BACKEND, params)
}

const handlePaymentCallbackAPI = (params) => {
    const URL_BACKEND = '/api/payment/callback'
    return axios.get(URL_BACKEND, { params })
}

export {
    bookingAPI,
    cancelBookingAPI,
    initiatePaymentAPI,
    retryPaymentAPI,
    handlePaymentCallbackAPI
}