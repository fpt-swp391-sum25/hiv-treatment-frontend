import { message, notification } from "antd";
import axios from "axios";

// Log baseURL to help with debugging
const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
console.log('Backend URL:', baseURL);

const instance = axios.create({
    baseURL: baseURL
})

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Check if token exists and add to headers
    if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
        const token = window.localStorage.getItem('access_token');
        config.headers.Authorization = 'Bearer ' + token;
        console.log('Token found, adding to request headers:', token.substring(0, 15) + '...');
    } else {
        console.log('No access token found in localStorage for this request');
        // Không tự động chuyển hướng đến trang đăng nhập
        // Để các trang công khai vẫn hoạt động bình thường
    }

    // Log the full request for debugging
    console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        headers: config.headers,
        data: config.data
    });

    return config;
}, function (error) {
    // Do something with request error
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
});


// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log("Response received from " + response.config.url + ":", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
    });

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
    // More detailed error logging
    console.error("API Error on " + (error.config?.url || 'unknown endpoint') + ":");

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        console.error('Error response data:', error.response.data);
        console.error('Request that caused the error:', {
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
            data: error.config?.data
        });

        // Chỉ thông báo lỗi xác thực, không tự động chuyển hướng
        if (error.response.status === 403) {
            const errorMessage = error.response.data?.error || 'Access denied';
            if (errorMessage.includes('Token expired') || errorMessage.includes('Invalid token')) {
                // Token expired or invalid
                localStorage.removeItem('access_token');

                // message.error("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.")
                // notification.error({
                //     message: 'Hệ thống',
                //     description: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                // });
                localStorage.setItem('auth_error', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/login';
            }
            // else {
            //     localStorage.setItem('auth_error', 'Thông tin đăng nhập không hợp lệ')
            //     window.location.href = '/login';
            // }
        }

        if (error.response.data) return error.response.data;
    } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
    }

    if (error.response && error.response.data) return error.response.data;
    return Promise.reject(error);
});

export default instance