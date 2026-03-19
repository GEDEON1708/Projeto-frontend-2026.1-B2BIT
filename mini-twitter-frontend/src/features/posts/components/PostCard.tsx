import { Heart, Pencil, Trash2 } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { formatDate } from '../../../utils/formatDate';
import type { Post } from '../types/post';

type PostCardProps = {
  post: Post;
  isAuthenticated: boolean;
  isOwner: boolean;
  likedByMe: boolean;
  isLikeLoading: boolean;
  onLike: (postId: number) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
};

export function PostCard({
  post,
  isAuthenticated,
  isOwner,
  likedByMe,
  isLikeLoading,
  onLike,
  onEdit,
  onDelete,
}: PostCardProps) {
  return (
    <article className="panel overflow-hidden p-4 sm:p-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span className="text-[1.375rem] font-semibold text-white">{post.authorName}</span>
            <span>@{post.authorName.toLowerCase().replace(/\s+/g, '')}</span>
            <span>&middot;</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-white">{post.title}</h2>
        </div>

        {isOwner ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Editar post"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="rounded-xl p-2 text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
              aria-label="Deletar post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </header>

      <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-slate-200">{post.content}</p>

      {post.image ? (
        <div className="mt-4 overflow-hidden rounded-2xl bg-[#082349]">
          <img
            src={post.image}
            alt={post.title}
            className="max-h-[420px] w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <footer className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onLike(post.id)}
          disabled={!isAuthenticated || isLikeLoading}
          aria-pressed={likedByMe}
          className={`inline-flex items-center gap-2 rounded-full px-2 py-1 transition ${
            likedByMe ? 'text-rose-400' : 'text-slate-300'
          } ${!isAuthenticated ? 'cursor-not-allowed opacity-60' : 'hover:bg-white/5'}`}
        >
          {isLikeLoading ? (
            <Spinner />
          ) : (
            <Heart className={`h-6 w-6 ${likedByMe ? 'fill-current' : ''}`} />
          )}
          <span className="text-sm font-medium">{post.likesCount}</span>
        </button>

        {!isAuthenticated ? <span className="text-xs text-slate-400">Faca login para interagir</span> : null}
      </footer>
    </article>
  );
}
