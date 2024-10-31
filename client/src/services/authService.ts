import axios from 'axios';
import { AuthRequest, AuthResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:3000/api';

export const authService = {
  requestAuth: async (data: AuthRequest) => {
    const response = await axios.post(`${API_BASE_URL}/auth/request`, data);
    return response.data;
  },

  verifyAuth: async (data: AuthResponse) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        // 9025 에러인 경우 암호화된 데이터 그대로 반환
        if (error.response.data?.message?.includes('9025')) {
          return data;
        }
      }
      throw error;
    }
  }
};
