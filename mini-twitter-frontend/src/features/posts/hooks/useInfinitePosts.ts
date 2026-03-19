import { useInfiniteQuery } from '@tanstack/react-query';
import { getPosts } from '../api/getPosts';

export function useInfinitePosts(search: string) {
  return useInfiniteQuery({
    queryKey: ['posts', search],
    queryFn: ({ pageParam }) => getPosts({ pageParam, search }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loadedItems = allPages.reduce((total, page) => total + page.posts.length, 0);

      if (loadedItems >= lastPage.total) {
        return undefined;
      }

      return lastPage.page + 1;
    },
  });
}
