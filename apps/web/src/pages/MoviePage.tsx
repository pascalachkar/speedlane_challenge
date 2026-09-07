import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Clock, Pencil, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { api } from '../lib/api';
import type { Movie } from '../lib/types';
import styles from './MoviePage.module.css';

export function MoviePage() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => api<{ data: Movie }>(`/movies/${slug}`),
  });
  const add = useMutation({
    mutationFn: (id: string) => api(`/watchlist/${id}`, { method: 'PUT' }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['watchlist'] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/movies/${id}`, { method: 'DELETE' }),
    onSuccess: () => navigate('/'),
  });
  if (query.isLoading) return <div className="state page-state">Loading film…</div>;
  if (!query.data)
    return (
      <div className="state page-state">
        <h2>Film not found</h2>
      </div>
    );
  const movie = query.data.data;
  return (
    <main className={styles.detail}>
      <div
        className={styles.backdrop}
        style={{
          backgroundImage: `linear-gradient(90deg,#0b0d12 8%,#0b0d12cc 48%,#0b0d1266),url("${movie.backdropUrl ?? movie.posterUrl}")`,
        }}
      />
      <div className={styles.content}>
        <img className={styles.poster} src={movie.posterUrl} alt={`Poster for ${movie.title}`} />
        <div className={styles.copy}>
          <div className={styles.chips}>
            {movie.genres.map(({ genre }) => (
              <span key={genre.id}>{genre.name}</span>
            ))}
          </div>
          <h1>{movie.title}</h1>
          <p className={styles.meta}>
            <span>{new Date(movie.releaseDate).getUTCFullYear()}</span>
            <span>
              <Clock size={16} /> {movie.runtimeMinutes} min
            </span>
            <span>
              <Star size={16} fill="currentColor" /> {Number(movie.averageRating).toFixed(1)}
            </span>
            {movie.contentRating && <span>{movie.contentRating}</span>}
          </p>
          <p className={styles.synopsis}>{movie.synopsis}</p>
          <p>
            <strong>Directed by</strong>{' '}
            {movie.directors.map(({ director }) => director.name).join(', ')}
          </p>
          <div className={styles.actions}>
            {user ? (
              <button
                className="button button-primary"
                disabled={add.isPending}
                onClick={() => add.mutate(movie.id)}
              >
                <Bookmark size={17} /> {add.isSuccess ? 'Saved' : 'Add to watchlist'}
              </button>
            ) : (
              <Link className="button button-primary" to="/login">
                Sign in to save
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <Link className="button button-quiet" to={`/admin/movies/${movie.id}/edit`}>
                  <Pencil size={17} /> Edit
                </Link>
                <button
                  className={`button ${styles.danger}`}
                  onClick={() =>
                    window.confirm('Delete this movie permanently?') && remove.mutate(movie.id)
                  }
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
