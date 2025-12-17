import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const shortenUrl = async (longUrl) => {
  const response = await api.post('/shorten', { longUrl });
  return response.data;
};

export const getLinks = async () => {
  const response = await api.get('/links');
  return response.data;
};

export const deleteLink = async (id) => {
  const response = await api.delete(`/links/${id}`);
  return response.data;
};

export default api;

