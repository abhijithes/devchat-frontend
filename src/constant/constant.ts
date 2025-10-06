const isProduction = true;
export const dev_api_url = 'http://localhost:5001/api'
export const producttion_api_url = 'https://devchat-backend-kpfa.onrender.com/api'
export const api_url = 'https://devchat-backend-kpfa.onrender.com/api';
export const current_url = isProduction ? api_url : dev_api_url;

export const endpoints = {
    // Authentication
    register: `${current_url}/users/register`,
    login: `${current_url}/users/login`,
    searchUser: `${current_url}/users/searchUser`,
    getUserById: (id) => `${current_url}/users/${id}`,

    addmember: (id) => `${current_url}/projects/addmember/${id}`,
    removeMember: (id) => `${current_url}/projects/removeMember/${id}`,
    addmanager: (id) => `${current_url}/projects/addmanager/${id}`,

    // Document Upload
    upload: `${current_url}/upload`,
    addDoc: (id) => `${current_url}/projects/uploudDocument/${id}`,

    // Projects
    createProject: `${current_url}/projects/createProject`,
    getAllProjectNames: `${current_url}/projects/projectNames`,
    getProjectById: (id) => `${current_url}/projects/${id}`,
};
