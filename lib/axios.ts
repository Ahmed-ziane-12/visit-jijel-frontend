import Axios from 'axios';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true, // sends cookies on every request (required for Sanctum)
    withXSRFToken: true, // axios reads the XSRF-TOKEN cookie and sends it as a header automatically
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// If CSRF token expires mid-session, refresh it and retry the request once
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419 && !error.config._retry) {
            error.config._retry = true;
            await axios.get('/sanctum/csrf-cookie');
            return axios(error.config);
        }
        return Promise.reject(error);
    },
);

export default axios;
