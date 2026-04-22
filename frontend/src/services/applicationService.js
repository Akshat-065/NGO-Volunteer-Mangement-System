import api from "./api";

export const applyToEvent = async (eventId) => {
  const { data } = await api.post("/apply", { eventId });
  return data;
};

export const getApplications = async (params = {}) => {
  const { data } = await api.get("/applications", { params });
  return data;
};

export const updateApplication = async (id, payload) => {
  const { data } = await api.put(`/applications/${id}`, payload);
  return data;
};

