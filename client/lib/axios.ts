import axios from 'axios';

export const api = axios.create({
  // En Vercel se usa la variable NEXT_PUBLIC_API_URL; en tu computador, localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

export const getErrorMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || 'error';
  }
  return 'error';
};