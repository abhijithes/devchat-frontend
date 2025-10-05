export const getToken = (): string | null => {
  return localStorage.getItem("token") || null;
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
};
