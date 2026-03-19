import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toggleLike } from '../api/toggleLike';
import type { PostsResponse } from '../types/post';

type UsePostLikeOptions = {
  search: string;
  likedPostStates: Record<number, boolean>;
  onServerResolve: (postId: number, liked: boolean) => void;
};

type LikeContext = {
  previousData?: InfiniteData<PostsResponse>;
  previousLikedState?: boolean;
  previousLikesCount?: number;
  appliedOptimisticUpdate: boolean;
};

function updatePostLikes(
  data: InfiniteData<PostsResponse> | undefined,
  postId: number,
  updater: (likesCount: number) => number,
) {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          likesCount: updater(post.likesCount),
        };
      }),
    })),
  };
}

export function usePostLike({ search, likedPostStates, onServerResolve }: UsePostLikeOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => toggleLike(postId),
    onMutate: async (postId): Promise<LikeContext> => {
      await queryClient.cancelQueries({ queryKey: ['posts', search] });

      const previousData = queryClient.getQueryData<InfiniteData<PostsResponse>>(['posts', search]);
      const previousLikedState = likedPostStates[postId];
      const previousPost = previousData?.pages
        .flatMap((page) => page.posts)
        .find((post) => post.id === postId);
      const previousLikesCount = previousPost?.likesCount;
      const appliedOptimisticUpdate = typeof previousLikedState === 'boolean';

      if (appliedOptimisticUpdate) {
        const optimisticLiked = !previousLikedState;

        queryClient.setQueryData<InfiniteData<PostsResponse>>(['posts', search], (current) =>
          updatePostLikes(current, postId, (likesCount) =>
            Math.max(likesCount + (optimisticLiked ? 1 : -1), 0),
          ),
        );
        onServerResolve(postId, optimisticLiked);
      }

      return {
        previousData,
        previousLikedState,
        previousLikesCount,
        appliedOptimisticUpdate,
      };
    },
    onError: (_error, postId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['posts', search], context.previousData);
      }

      if (context?.appliedOptimisticUpdate && typeof context.previousLikedState === 'boolean') {
        onServerResolve(postId, context.previousLikedState);
      }
    },
    onSuccess: (response, postId, context) => {
      onServerResolve(postId, response.liked);

      const previousLikesCount = context?.previousLikesCount;

      if (typeof previousLikesCount === 'number') {
        queryClient.setQueryData<InfiniteData<PostsResponse>>(['posts', search], (current) =>
          updatePostLikes(current, postId, () => Math.max(previousLikesCount + (response.liked ? 1 : -1), 0)),
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', search] });
    },
  });
}
