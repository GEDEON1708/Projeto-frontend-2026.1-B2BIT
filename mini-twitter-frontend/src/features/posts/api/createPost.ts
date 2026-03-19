import { api } from '../../../lib/api';

type CreatePostPayload = {
  title: string;
  content: string;
  image?: string;
};

export async function createPost(payload: CreatePostPayload) {
  const { data } = await api.post('/posts', payload);
  return data;
}
