import { api } from '../../../lib/api';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export async function registerRequest(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}
