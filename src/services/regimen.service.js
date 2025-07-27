import axios from './axios.customize'

const fetchRegimensByDoctorIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/regimen/doctor-id/${doctorId}`
    return axios.get(URL_BACKEND)
}

const fetchAllRegimensAPI = () => {
    const URL_BACKEND = '/api/regimen'
    return axios.get(URL_BACKEND)
}

const createRegimenAPI = (components, regimenName,
    description, indications, contraindications, doctorId) => {
    const createData = {
        components,
        regimenName,
        description,
        indications,
        contraindications,
        doctorId
    }
    const URL_BACKEND = '/api/regimen';
    return axios.post(URL_BACKEND, createData)
}

const updateRegimenAPI = (id, components, regimenName,
    description, indications, contraindications) => {
    const createData = {
        components,
        regimenName,
        description,
        indications,
        contraindications
    }
    const URL_BACKEND = `/api/regimen/${id}`;
    return axios.put(URL_BACKEND, createData)
}

const deleteRegimenAPI = (id) => {
    const URL_BACKEND = `/api/regimen/${id}`;
    return axios.delete(URL_BACKEND)
}

export {
    deleteRegimenAPI,
    updateRegimenAPI,
    createRegimenAPI,
    fetchAllRegimensAPI,
    fetchRegimensByDoctorIdAPI,
}