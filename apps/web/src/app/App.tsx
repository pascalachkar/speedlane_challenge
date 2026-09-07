import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Layout } from '../components/Layout';
import { CataloguePage } from '../pages/CataloguePage';
import { LoginPage } from '../pages/LoginPage';
import { MovieFormPage } from '../pages/MovieFormPage';
import { MoviePage } from '../pages/MoviePage';
import { WatchlistPage } from '../pages/WatchlistPage';

function ProtectedRoute({ admin = false, children }: { admin?: boolean; children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <div className="state page-state">Checking your session…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CataloguePage />} />
        <Route path="movies/:slug" element={<MoviePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/movies/new"
          element={
            <ProtectedRoute admin>
              <MovieFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/movies/:id/edit"
          element={
            <ProtectedRoute admin>
              <MovieFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="state page-state">
              <h1>Page not found</h1>
              <p>That reel seems to be missing.</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
