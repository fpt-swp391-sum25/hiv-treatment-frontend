import axios from './axios.customize'

const deleteTestResultAPI = (testResultId) => {
    const URL_BACKEND = `/api/test-result/${testResultId}`
    return axios.delete(URL_BACKEND)
}

const createTestResultAPI = (type, note, expectedResultTime, healthRecordId) => {
    const testResultData = {
        type,
        note,
        expectedResultTime,
        healthRecordId,
    }
    const URL_BACKEND = '/api/test-result'
    return axios.post(URL_BACKEND, testResultData)
}

const updateTestResultAPI = (testResultId, type, result, unit, note, expectedResultTime, actualResultTime) => {
    const testResultData = {
        type,
        result,
        unit,
        note,
        expectedResultTime,
        actualResultTime
    }
    const URL_BACKEND = `/api/test-result/${testResultId}`
    return axios.put(URL_BACKEND, testResultData)
}

export {
    deleteTestResultAPI,
    createTestResultAPI,
    updateTestResultAPI
}