import api from "./api";

export const getVolunteers = async (params = {}) => {
  const { data } = await api.get("/volunteers", { params });
  return data;
};

export const createVolunteer = async (payload) => {
  const { data } = await api.post("/volunteers", payload);
  return data;
};

export const updateVolunteer = async (id, payload) => {
  const { data } = await api.put(`/volunteers/${id}`, payload);
  return data;
};

export const deleteVolunteer = async (id) => {
  const { data } = await api.delete(`/volunteers/${id}`);
  return data;
};

