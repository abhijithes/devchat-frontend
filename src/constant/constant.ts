const isProduction = true;
export const dev_api_url = "http://localhost:5001/api";
export const producttion_api_url =
  "https://devchat-backend-kpfa.onrender.com/api";
export const api_url = "https://devchat-backend-kpfa.onrender.com/api";
export const socket_url ="https://preconcessive-prefamously-arya.ngrok-free.dev";
//  ||"https://devchat-backend-kpfa.onrender.com";
export const current_url = isProduction ? api_url : dev_api_url;

export const endpoints = {
  // Existing routes...
  register: `${current_url}/users/register`,
  login: `${current_url}/users/login`,
  searchUser: `${current_url}/users/searchUser`,
  getUserById: (id) => `${current_url}/users/${id}`,
  getUserWithProjects: (id) => `${current_url}/users/${id}?include=projects`,
  updatePinnedProj: (id) => `${current_url}/users/${id}/updatePinnedProject`,

  addmember: (id) => `${current_url}/projects/addmember/${id}`,
  removeMember: (id) => `${current_url}/projects/removeMember/${id}`,
  removeManager: (id) => `${current_url}/projects/removeManager/${id}`,
  addmanager: (id) => `${current_url}/projects/addmanager/${id}`,

  upload: `${current_url}/upload`,
  addDoc: (id) => `${current_url}/projects/uploudDocument/${id}`,
  deleteDoc: (projectid, docId) =>
    `${current_url}/projects/${projectid}/deleteDoc/${docId}`,

  createProject: `${current_url}/projects/createProject`,
  getAllProjectNames: `${current_url}/projects/projectNames`,
  getProjectById: (id) => `${current_url}/projects/${id}`,

  // New Task routes
  createTask: (projectId) =>
    `${current_url}/tickets/projects/${projectId}/tasks`,
  getTasks: (projectId) => `${current_url}/tickets/projects/${projectId}/tasks`,
  updateTask: (projectId, taskId) =>
    `${current_url}/projects/${projectId}/tasks/${taskId}`,
  deleteTask: (projectId, taskId) =>
    `${current_url}/projects/${projectId}/tasks/${taskId}`,
  getTaskPreview: (projectId) =>
    `${current_url}/tickets/projects/${projectId}/tasks/preview`,
};
