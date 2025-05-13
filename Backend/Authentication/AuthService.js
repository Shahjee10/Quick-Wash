import axios from 'axios';

const API_URL = 'http://192.168.1.53:5000';

export const registerUser = async (username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
