import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { InlineMessage } from '../../../components/ui/InlineMessage';
import { Spinner } from '../../../components/ui/Spinner';
import { logoutRequest } from '../../auth/api/logout';
import { deletePost } from '../api/deletePost';
import { CreatePostCard } from '../components/CreatePostCard';
import { EditPostModal } from '../components/EditPostModal';
import { PostCard } from '../components/PostCard';
import { SearchBar } from '../components/SearchBar';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { usePostLike } from '../hooks/usePostLike';
import type { Post } from '../types/post';
import { useAuthStore } from '../../../stores/auth-store';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { useDebouncedValue } from '../../../utils/useDebouncedValue';

function getLikedPostsStorageKey(userId: number) {
  return `mini-twitter-liked-posts-${userId}`;
}

function readLikedPostsState(userId: number) {
  try {
    const storedValue = window.localStorage.getItem(getLikedPostsStorageKey(userId));

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {};
    }

    return Object.entries(parsedValue).reduce<Record<number, boolean>>((accumulator, [postId, liked]) => {
      if (typeof liked === 'boolean') {
        accumulator[Number(postId)] = liked;
      }

      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

export function FeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [search, setSearch] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [likedPostStates, setLikedPostStates] = useState<Record<number, boolean>>({});
  const debouncedSearch = useDebouncedValue(search, 400);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfinitePosts(debouncedSearch);

  const posts = useMemo(() => data?.pages.flatMap((page) => page.posts) ?? [], [data]);

  useEffect(() => {
    if (!user) {
      setLikedPostStates({});
      return;
    }

    setLikedPostStates(readLikedPostsState(user.id));
  }, [user]);

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearSession();
      navigate('/auth');
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', debouncedSearch] });
    },
  });

  const handleLikedPostStateChange = (postId: number, liked: boolean) => {
    setLikedPostStates((current) => {
      const nextValue = {
        ...current,
        [postId]: liked,
      };

      if (user) {
        window.localStorage.setItem(getLikedPostsStorageKey(user.id), JSON.stringify(nextValue));
      }

      return nextValue;
    });
  };

  const likeMutation = usePostLike({
    search: debouncedSearch,
    likedPostStates,
    onServerResolve: handleLikedPostStateChange,
  });

  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = observerTargetRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleDeletePost = (postId: number) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este post?');

    if (!confirmed) {
      return;
    }

    deletePostMutation.mutate(postId);
  };

  return (
    <main className="app-shell min-h-screen">
      <div className="mx-auto min-h-screen max-w-[1120px] border-x border-[#1f3353]">
        <header className="sticky top-0 z-20 border-b border-[#1f3353] bg-[#061126]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[640px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1 text-2xl font-bold text-white sm:text-3xl">Mini Twitter</div>
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </header>

        <section className="mx-auto max-w-[640px] px-4 py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {user ? (
              <div className="flex min-w-0 items-center gap-3 text-slate-200">
                <UserCircle2 className="h-10 w-10 shrink-0 text-brand-400" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{user.name}</p>
                  <p className="truncate text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-300">Voce esta navegando como visitante.</p>
            )}

            {user ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11 gap-2 self-start sm:self-auto"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? <Spinner /> : <LogOut className="h-4 w-4" />}
                Sair
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 self-start px-5 sm:self-auto"
                onClick={() => navigate('/auth')}
              >
                Entrar
              </Button>
            )}
          </div>

          {user ? <CreatePostCard search={debouncedSearch} /> : null}

          {deletePostMutation.isError ? (
            <div className="mt-4">
              <InlineMessage
                message={getErrorMessage(
                  deletePostMutation.error,
                  'Nao foi possivel excluir o post neste momento.',
                )}
              />
            </div>
          ) : null}

          {logoutMutation.isError ? (
            <div className="mt-4">
              <InlineMessage
                message={getErrorMessage(
                  logoutMutation.error,
                  'Nao foi possivel encerrar a sessao agora. Tente novamente.',
                )}
              />
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="panel flex items-center justify-center gap-3 p-8 text-slate-200">
                <Spinner />
                Carregando posts...
              </div>
            ) : null}

            {isError ? (
              <InlineMessage message={getErrorMessage(error, 'Erro ao carregar a timeline. Tente novamente.')} />
            ) : null}

            {!isLoading && !isError && posts.length === 0 ? (
              <EmptyState
                title="Nenhum post encontrado"
                description={
                  debouncedSearch
                    ? 'Tente alterar o termo da busca para encontrar outros posts.'
                    : 'Ainda nao existem publicacoes. Seja a primeira pessoa a postar.'
                }
              />
            ) : null}

            {posts.map((post) => {
              const isOwner = user?.id === post.authorId;
              const likedByMe = likedPostStates[post.id] === true;

              return (
                <PostCard
                  key={post.id}
                  post={post}
                  isAuthenticated={Boolean(user)}
                  isOwner={Boolean(isOwner)}
                  likedByMe={likedByMe}
                  isLikeLoading={likeMutation.isPending && likeMutation.variables === post.id}
                  onLike={(postId) => likeMutation.mutate(postId)}
                  onEdit={(selectedPost) => setEditingPost(selectedPost)}
                  onDelete={handleDeletePost}
                />
              );
            })}
          </div>

          <div ref={observerTargetRef} className="h-10" />

          {isFetchingNextPage ? (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-300">
              <Spinner />
              Carregando mais posts...
            </div>
          ) : null}

          {!isFetchingNextPage && isFetching ? (
            <div className="mt-2 text-center text-sm text-slate-400">Atualizando resultados...</div>
          ) : null}
        </section>
      </div>

      <EditPostModal post={editingPost} search={debouncedSearch} onClose={() => setEditingPost(null)} />
    </main>
  );
}
