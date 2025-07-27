import axios from './axios.customize'

const fetchDoctorProfileAPI = () => {
    const URL_BACKEND = '/api/doctor-profile'
    return axios.get(URL_BACKEND)
}

const fetchDoctorByIdAPI = (doctorId) => {
    const URL_BACKEND = `/api/doctor-profile/doctor-id/${doctorId}`;
    return axios.get(URL_BACKEND);
}

const updateDoctorProfileAPI = (doctorProfileId, profileData) => {
    // Đảm bảo startYear là chuỗi
    if (profileData.startYear !== null && profileData.startYear !== undefined) {
        profileData.startYear = String(profileData.startYear);
    }

    console.log(`Updating doctor profile ID ${doctorProfileId} with data:`, profileData);
    const URL_BACKEND = `/api/doctor-profile/${doctorProfileId}`;
    return axios.put(URL_BACKEND, profileData);
}

const fetchDoctorProfileByDoctorIdAPI = (doctorId) => {
    console.log(`Fetching doctor profile for doctor ID: ${doctorId}`);
    const URL_BACKEND = `/api/doctor-profile/doctor-id/${doctorId}`;
    return axios.get(URL_BACKEND);
};

const createDoctorProfileAPI = (profileData) => {
    console.log(`Creating new doctor profile with data:`, profileData);
    // Đảm bảo startYear là chuỗi
    if (profileData.startYear !== null && profileData.startYear !== undefined) {
        profileData.startYear = String(profileData.startYear);
    }
    const URL_BACKEND = `/api/doctor-profile`;
    return axios.post(URL_BACKEND, profileData);
};

export {
    fetchDoctorByIdAPI,
    fetchDoctorProfileAPI,
    fetchDoctorProfileByDoctorIdAPI,
    updateDoctorProfileAPI,
    createDoctorProfileAPI
}