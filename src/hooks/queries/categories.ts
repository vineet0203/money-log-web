import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export interface Category {
  id: number;
  name: string;
  icon_name: string;
  color: string;
  budget_limit: string | null;
  spent_this_month: string;
}

export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
  });
};
