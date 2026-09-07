import { Bookmark, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Movie } from '../lib/types';
import styles from './MovieCard.module.css';
import { MoviePoster } from './MoviePoster';
export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className={styles.card}>
      <Link to={`/movies/${movie.slug}`}>
        <div className={styles.poster}>
          <MoviePoster src={movie.posterUrl} title={movie.title} loading="lazy" />
          <span className={styles.rating}>
            <Star size={13} fill="currentColor" /> {Number(movie.averageRating).toFixed(1)}
          </span>
          <span className={styles.action} aria-hidden="true">
            <Bookmark size={18} />
          </span>
        </div>
        <div className={styles.copy}>
          <h3>{movie.title}</h3>
          <p>
            {new Date(movie.releaseDate).getUTCFullYear()} ·{' '}
            {movie.directors.map(({ director }) => director.name).join(', ')}
          </p>
        </div>
      </Link>
    </article>
  );
}
