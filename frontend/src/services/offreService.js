import axiosInstance from "./axiosInstance";

export const getAllOffres = async (params) => {
  const { data } = await axiosInstance.get("/offres", { params });
  return data;
};

export const getOffreById = async (id) => {
  const { data } = await axiosInstance.get(`/offres/${id}`);
  return data;
};

export const postulerOffre = async (offreId) => {
  const { data } = await axiosInstance.post(`/offres/${offreId}/postuler`);
  return data;
}; 