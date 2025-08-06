import axios from './axios.customize'

const createAccountAPI = (username, password, email, role) => {
    const URL_BACKEND = '/api/user/create'
    const data = {
        username,
        password,
        email,
        role
    }
    return axios.post(URL_BACKEND, data)
}

const fetchAccountByRoleAPI = (role) => {
    // Đảm bảo role được viết hoa theo yêu cầu của BE
    const uppercaseRole = role.toUpperCase();
    const URL_BACKEND = `/api/user/${uppercaseRole}`;
    return axios.get(URL_BACKEND);
}


const updateAccountAPI = (id, username, email) => {
    const URL_BACKEND = `/api/user/${id}`
    const data = {
        username,
        email
    }

    return axios.put(URL_BACKEND, data)
}

const deleteAccountAPI = (id) => {
    const URL_BACKEND = `/api/user/${id}`
    return axios.delete(URL_BACKEND)
}

const fetchAllDoctorsAPI = () => {
    const URL_BACKEND = '/api/user/DOCTOR'; 
    return axios.get(URL_BACKEND);
}

const fetchAllCashiersAPI = () => {
    const URL_BACKEND = '/api/user/CASHIER'; 
    return axios.get(URL_BACKEND);
}

const fetchUsersAPI = () => {
    const URL_BACKEND = '/api/user/patient'
    return axios.get(URL_BACKEND)
}

const fetchUserInfoAPI = (id) => {
    const URL_BACKEND = `/api/user/user-id/${id}`
    return axios.get(URL_BACKEND)
}

const updateProfileAPI = (values) => {
    const URL_BACKEND = `/api/user/${values.id}`
    return axios.put(URL_BACKEND, values)
}

const updateUserAPI = (id, updateData) => {
    const URL_BACKEND = `/api/user/${id}`;
    return axios.put(URL_BACKEND, updateData)
}

const fetchUsersByRoleAPI = (role) => {
    // Đảm bảo role được viết hoa theo yêu cầu của BE
    const uppercaseRole = role.toUpperCase();
    // Endpoint sử dụng đúng với backend API
    const URL_BACKEND = `/api/user/${uppercaseRole}`;

    return axios.get(URL_BACKEND);
}

const fetchAllLabTechniciansAPI = () => {
    const URL_BACKEND = '/api/user/LAB_TECHNICIAN';
    return axios.get(URL_BACKEND);
}

const fetchUsersByRoleAndStatusAPI = (role, status) => {
    const URL_BACKEND = `/api/user/${role.toUpperCase()}/account-status/${status}`;
    return axios.get(URL_BACKEND);
};

const fetchUsersByRoleAndVerificationAPI = (role, isVerified) => {
    const URL_BACKEND = `/api/user/${role.toUpperCase()}/mail-verification-status/${isVerified}`;
    return axios.get(URL_BACKEND);
};

export {
    fetchAccountByRoleAPI,
    fetchAllDoctorsAPI,
    fetchAllLabTechniciansAPI,
    fetchAllCashiersAPI,
    fetchUserInfoAPI,
    fetchUsersAPI,
    fetchUsersByRoleAPI,
    fetchUsersByRoleAndStatusAPI,
    fetchUsersByRoleAndVerificationAPI,
    createAccountAPI,
    updateAccountAPI,
    deleteAccountAPI,
    updateProfileAPI,
    updateUserAPI,

}