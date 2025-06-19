const axios = require('axios');

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway';

async function getUserById(id, token) {
  const url = `${API_GATEWAY_URL}/api/auth/users/${id}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(url, { headers });
  return response.data;
}

async function getOffreById(id, token) {
  const url = `${API_GATEWAY_URL}/api/offres/${id}`;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(url, { headers });
  return response.data;
}

module.exports = { getUserById, getOffreById };