import { api } from '../../../lib/api';

type UpdatePostPayload = {
  id: number;
  title: string;
  content: string;
  image?: string;
};

export async function updatePost({ id, ...payload }: UpdatePostPayload) {
  const { data } = await api.put(`/posts/${id}`, payload);
  return data;
}
