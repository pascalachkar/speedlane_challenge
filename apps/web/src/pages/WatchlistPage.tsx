import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MovieCard } from '../components/MovieCard';
import { api } from '../lib/api';
import type { Movie } from '../lib/types';
import styles from './WatchlistPage.module.css';
interface WatchlistItem {
  movie: Movie;
}
export function WatchlistPage() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api<{ data: WatchlistItem[] }>('/watchlist'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/watchlist/${id}`, { method: 'DELETE' }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['watchlist'] }),
  });
  return (
    <main className={styles.page}>
      <p className="eyebrow">Saved for later</p>
      <h1>My watchlist</h1>
      {query.isLoading ? (
        <div className="state">Loading watchlist…</div>
      ) : !query.data?.data.length ? (
        <div className="state">
          <h3>Your watchlist is waiting.</h3>
          <p>Save a film from its detail page.</p>
        </div>
      ) : (
        <div className="movie-grid">
          {query.data.data.map(({ movie }) => (
            <div key={movie.id}>
              <MovieCard movie={movie} />
              <button
                className={`text-button ${styles.remove}`}
                onClick={() => remove.mutate(movie.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
