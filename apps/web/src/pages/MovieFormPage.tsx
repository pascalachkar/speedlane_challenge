import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { Director, Genre, Movie } from '../lib/types';
import styles from './MovieFormPage.module.css';

export function MovieFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const movieQuery = useQuery({
    queryKey: ['movie-edit', id],
    queryFn: () => api<{ data: Movie }>(`/movies/${id}`),
    enabled: Boolean(id),
  });
  const genres = useQuery({
    queryKey: ['genres'],
    queryFn: () => api<{ data: Genre[] }>('/genres'),
  });
  const directors = useQuery({
    queryKey: ['directors'],
    queryFn: () => api<{ data: Director[] }>('/directors'),
  });
  const save = useMutation({
    mutationFn: (body: unknown) =>
      api<{ data: Movie }>(id ? `/movies/${id}` : '/movies', {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: ({ data }) => navigate(`/movies/${data.slug}`),
    onError: (reason) =>
      setError(reason instanceof ApiError ? reason.message : 'Unable to save movie'),
  });
  if (id && movieQuery.isLoading) return <div className="state page-state">Loading movie…</div>;
  const movie = movieQuery.data?.data;
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    save.mutate({
      title: data.get('title'),
      synopsis: data.get('synopsis'),
      releaseDate: data.get('releaseDate'),
      runtimeMinutes: Number(data.get('runtimeMinutes')),
      contentRating: data.get('contentRating') || undefined,
      posterUrl: data.get('posterUrl'),
      backdropUrl: data.get('backdropUrl') || undefined,
      averageRating: Number(data.get('averageRating')),
      directorIds: [data.get('directorId')],
      genreIds: data.getAll('genreIds'),
    });
  }
  return (
    <main className={styles.page}>
      <p className="eyebrow">Admin collection</p>
      <h1>{id ? 'Edit movie' : 'Add a movie'}</h1>
      <p>Keep catalogue information clear, accurate, and useful.</p>
      <form className={styles.form} onSubmit={submit}>
        <label>
          Title
          <input name="title" required maxLength={200} defaultValue={movie?.title} />
        </label>
        <label>
          Release date
          <input
            type="date"
            name="releaseDate"
            required
            defaultValue={movie?.releaseDate.slice(0, 10)}
          />
        </label>
        <label className={styles.wide}>
          Synopsis
          <textarea
            name="synopsis"
            required
            minLength={20}
            rows={5}
            defaultValue={movie?.synopsis}
          />
        </label>
        <label>
          Runtime (minutes)
          <input
            type="number"
            name="runtimeMinutes"
            min="1"
            max="1000"
            required
            defaultValue={movie?.runtimeMinutes}
          />
        </label>
        <label>
          Content rating
          <input name="contentRating" maxLength={20} defaultValue={movie?.contentRating} />
        </label>
        <label>
          Average rating
          <input
            type="number"
            name="averageRating"
            min="0"
            max="10"
            step="0.1"
            required
            defaultValue={movie?.averageRating}
          />
        </label>
        <label>
          Director
          <select name="directorId" required defaultValue={movie?.directors[0]?.director.id}>
            <option value="">Select director</option>
            {directors.data?.data.map((director) => (
              <option value={director.id} key={director.id}>
                {director.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.wide}>
          Poster URL
          <input type="url" name="posterUrl" required defaultValue={movie?.posterUrl} />
        </label>
        <label className={styles.wide}>
          Backdrop URL
          <input type="url" name="backdropUrl" defaultValue={movie?.backdropUrl} />
        </label>
        <fieldset className={styles.wide}>
          <legend>Genres</legend>
          <div className={styles.checkGrid}>
            {genres.data?.data.map((genre) => (
              <label key={genre.id}>
                <input
                  type="checkbox"
                  name="genreIds"
                  value={genre.id}
                  defaultChecked={movie?.genres.some((item) => item.genre.id === genre.id)}
                />
                {genre.name}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p className={`form-error ${styles.wide}`} role="alert">
            {error}
          </p>
        )}
        <div className={`${styles.actions} ${styles.wide}`}>
          <button type="button" className="button button-quiet" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="button button-primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save movie'}
          </button>
        </div>
      </form>
    </main>
  );
}
