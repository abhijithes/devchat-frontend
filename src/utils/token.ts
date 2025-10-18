export const getToken = (): string | null => {
  return localStorage.getItem("token") || null;
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
};

export const getUserPublicInfo = (): any | null => {
  const userData = localStorage.getItem("DEV_CHATX_USER_URD");
  return userData ? JSON.parse(userData) : null;
};

export const setUserPublicInfo = (data: any): void => {
  localStorage.setItem("DEV_CHATX_USER_URD", JSON.stringify(data));
};
