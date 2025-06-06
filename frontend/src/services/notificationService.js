import axiosInstance from "./axiosInstance";

export const getNotifications = async () => {
  const { data } = await axiosInstance.get("/notifications");
  return data;
}; 