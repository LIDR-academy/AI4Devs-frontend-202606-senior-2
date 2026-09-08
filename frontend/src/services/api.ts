import axios from 'axios';

// Shared HTTP client. CRA exposes env vars prefixed with REACT_APP_; falls back to the local backend.
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:3010',
});
