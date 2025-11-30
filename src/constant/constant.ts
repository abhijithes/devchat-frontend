const isProduction = true;

export const dev_api_url = "http://localhost:5001/api";
export const producttion_api_url =
  "https://devchat-backend-kpfa.onrender.com/api";
export const api_url = "https://devchat-backend-kpfa.onrender.com/api";

export const socket_url = isProduction
  ? "https://devchat-backend-kpfa.onrender.com"
  : "http://localhost:5001";

export const current_url = isProduction ? producttion_api_url : dev_api_url;

export const endpoints = {
  // Existing routes...
  register: `${current_url}/users/register`,
  login: `${current_url}/users/login`,
  searchUser: `${current_url}/users/searchUser`,

  // otp service api
  optSend: `${current_url}/users/otp`,
  otpVerify: `${current_url}/users/verifyotp`,

  getUserById: (id) => `${current_url}/users/${id}`,
  getUserWithProjects: (id) => `${current_url}/users/${id}?include=projects`,
  fetchPublicProfile: (id) =>
    `${current_url}/users/publicprofile/${id}?include=projects`,
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
  updateProject: (id) => `${current_url}/projects/updateProject/${id}`,
  updateProjectStatus: (id) => `${current_url}/projects/updateStatus/${id}`,
  deleteProject: (id) => `${current_url}/projects/${id}`,

  // New Task routes
  createTask: (projectId) =>
    `${current_url}/tickets/projects/${projectId}/tasks`,
  getTasks: (projectId, page, limit, query, sortfield) =>
    `${current_url}/tickets/projects/${projectId}/tasks/search?page=${page}&limit=${limit}&searchQuery=${query}&sortField=${sortfield}`,
  updateTask: (projectId, taskId) =>
    `${current_url}/tickets/projects/${projectId}/tasks/${taskId}`,
  deleteTask: (projectId, taskId) =>
    `${current_url}/tickets/projects/${projectId}/tasks/${taskId}`,
  getTaskPreview: (projectId) =>
    `${current_url}/tickets/projects/${projectId}/tasks/preview`,
  setTaskProgressStatus: (taskId) =>
    `${current_url}/tickets/task/${taskId}/progressPercentage`,

  getTaskData: (id) => `${current_url}/tickets/projects/task/${id}`,
  UpdateTaskDescriptions: (id) =>
    `${current_url}/tickets/task/${id}/editDescription`,
  AddTaskDocument: (id) => `${current_url}/tickets/task/${id}/adddocument`,
  deleteTicketDoc: (ticketId, docId) =>
    `${current_url}/tickets/task/${ticketId}/deletedocument/${docId}`,

  addComment: (id) => `${current_url}/tickets/task/${id}/comments`,
  editComment: (taskId, commentId) =>
    `${current_url}/tickets/task/${taskId}/comments/${commentId}`,
  deleteComment: (taskId, commentId) =>
    `${current_url}/tickets/task/${taskId}/comments/${commentId}`,

  //notification
  getNotifications: `${current_url}/notifications`,
  updateNotification: (id: string) => `${current_url}/notifications/${id}`,
  deleteNotification: (id) => `${current_url}/notifications/${id}`,
  deleteNotificationBulk: `${current_url}/notifications/bulkdelete`,

  // chat endpoints
  createChat: `${current_url}/chat/create`,
  getChatsList: `${current_url}/chat/chat-list`,
  getChats: (roomId: string) => `${current_url}/message/get-messages/${roomId}`,

  //Message endpoints
  sendMessage: `${current_url}/message/create`,
  updateMessage: (id) => `${current_url}/message/update/${id}`,
  deleteMessage: (id) => `${current_url}/message/delete/${id}`,
  markAsRead: `${current_url}/message/markasread`,
};
