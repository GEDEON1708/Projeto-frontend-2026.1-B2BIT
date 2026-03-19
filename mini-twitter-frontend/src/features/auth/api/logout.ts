import { api } from '../../../lib/api';

export async function logoutRequest() {
  const { data } = await api.post('/auth/logout');
  return data;
}
