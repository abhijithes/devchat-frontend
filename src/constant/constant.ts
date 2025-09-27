const isProduction = true;
export const dev_api_url = 'http://localhost:5001/api'
export const producttion_api_url = 'https://devchat-backend-kpfa.onrender.com/api'
export const api_url = 'https://devchat-backend-kpfa.onrender.com/api';
export const current_url = isProduction ? api_url : dev_api_url;

export const endpoints = {
    register:   `${current_url}/register`,
    login: `${current_url}/login`
}