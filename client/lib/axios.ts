import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

export const getErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || 'error';
  }
  return 'error';
};