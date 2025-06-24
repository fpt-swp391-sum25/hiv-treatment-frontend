import axios from "axios";


const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
})

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    }
    // Do something before request is sent
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});


// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log("Response received:", response);
    
    // Handle different response formats
    if (response.data) {
        if (response.data.data !== undefined) {
            // Format 1: { data: [...] }
            return response.data;
        } else if (Array.isArray(response.data)) {
            // Format 2: Direct array in data
            return { data: response.data };
        }
    }
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log(">>>>>>>>>> check error", error);
    if (error.response && error.response.data) return error.response.data;
    return Promise.reject(error);
});

export default instance