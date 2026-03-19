import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthPage } from '../features/auth/pages/AuthPage';
import { FeedPage } from '../features/posts/pages/FeedPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/feed" replace />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/feed',
    element: <FeedPage />,
  },
  {
    path: '*',
    element: <Navigate to="/feed" replace />,
  },
]);
