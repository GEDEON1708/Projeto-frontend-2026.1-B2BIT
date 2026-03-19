import { api } from '../../../lib/api';
import type { PostsResponse } from '../types/post';

type GetPostsParams = {
  pageParam?: number;
  search?: string;
};

export async function getPosts({ pageParam = 1, search }: GetPostsParams) {
  const { data } = await api.get<PostsResponse>('/posts', {
    params: {
      page: pageParam,
      search: search || undefined,
    },
  });

  return data;
}
