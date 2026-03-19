import { api } from '../../../lib/api';

export async function deletePost(postId: number) {
  const { data } = await api.delete(`/posts/${postId}`);
  return data;
}
