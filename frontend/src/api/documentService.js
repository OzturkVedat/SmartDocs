import api from "./axios";

export const uploadDocument = (formData) => api.post("/document", formData);
export const listDocuments = (page = 1, limit = 10) => api.get(`/document?page=${page}&limit=${limit}`);
export const getDocumentById = (id) => api.get(`/document/${id}`);
export const searchDocuments = (query) => api.get(`/document/search?q=${encodeURIComponent(query)}`);
export const deleteDocument = (id) => api.delete(`/document/${id}`);
export const extractKeywords = (id) => api.get(`/document/${id}/keywords`);
