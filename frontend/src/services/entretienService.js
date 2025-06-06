import axiosInstance from "./axiosInstance";

export const getUserEntretiens = async (params) => {
  const { data } = await axiosInstance.get("/entretients", { params });
  return data;
};

export const planifierEntretien = async (payload) => {
  const { data } = await axiosInstance.post("/entretients", payload);
  return data;
}; 