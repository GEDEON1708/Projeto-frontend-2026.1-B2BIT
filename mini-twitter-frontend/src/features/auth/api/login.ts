import { api } from '../../../lib/api';
import type { LoginResponse } from './types';

type LoginPayload = {
  email: string;
  password: string;
};

export async function loginRequest(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
}
