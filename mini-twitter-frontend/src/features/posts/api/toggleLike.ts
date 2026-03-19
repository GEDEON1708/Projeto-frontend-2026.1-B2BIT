import { api } from '../../../lib/api';

export type ToggleLikeResponse = {
  liked: boolean;
};

export async function toggleLike(postId: number) {
  const { data } = await api.post<ToggleLikeResponse>(`/posts/${postId}/like`);
  return data;
}
