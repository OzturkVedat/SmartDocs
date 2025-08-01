import api from "./axios";

export const uploadDocument = (formData) => api.post("/documents", formData);
export const listDocuments = (page = 1, limit = 10) => api.get(`/documents?page=${page}&limit=${limit}`);
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const searchDocuments = (query) => api.get(`/search?q=${encodeURIComponent(query)}`);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const extractKeywords = (id) => api.get(`/documents/${id}/keywords`);
