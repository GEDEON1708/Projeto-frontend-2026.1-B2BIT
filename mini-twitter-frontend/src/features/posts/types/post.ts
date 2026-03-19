export type Post = {
  id: number;
  title: string;
  content: string;
  image: string | null;
  authorId: number;
  authorName: string;
  createdAt: string;
  likesCount: number;
};

export type PostsResponse = {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
};
