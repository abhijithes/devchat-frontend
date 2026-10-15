import axios from "axios";

const api = axios.create({
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

function redirectToLogin(redirectTo) {
  if (!redirectTo) return;

  const alreadyOnLogin = window.location.pathname.includes("/login");

  try {
    const target = new URL(redirectTo, window.location.origin);
    if (alreadyOnLogin) return;
    window.location.replace(target.toString());
  } catch {
    if (!alreadyOnLogin) window.location.replace(redirectTo);
  }
}

api.interceptors.response.use(
  (response) => {
    const redirectTo = response?.data?.redirectTo;
    console.log('redirecting if...');
    
    if (redirectTo) {
      redirectToLogin(redirectTo);
      return Promise.reject(new axios.Cancel("Redirecting to login"));
    }
    return response;
  },
  (error) => {
    const redirectTo = error?.response?.data?.redirectTo;
    if (redirectTo) redirectToLogin(redirectTo);
    return Promise.reject(error);
  },
);

export default api;