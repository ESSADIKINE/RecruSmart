import axiosInstance from "./axiosInstance";

export const login = async (email, password) => {
  const { data } = await axiosInstance.post("/auth/login", { email, password });
  return data;
};

export const register = async (payload) => {
  const { data } = await axiosInstance.post("/auth/register", payload);
  return data;
};

export const getProfile = async () => {
  const { data } = await axiosInstance.get("/auth/profile");
  return data;
};

export const logout = () => {
  localStorage.removeItem("jwt");
}; 