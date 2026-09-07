import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Genre, MoviePage } from '../lib/types';
import { MovieCard } from '../components/MovieCard';
import styles from './CataloguePage.module.css';
export function CataloguePage() {
  const [params, setParams] = useSearchParams();
  const sentinel = useRef<HTMLDivElement>(null);
  const queryString = params.toString();
  const movies = useInfiniteQuery({
    queryKey: ['movies', queryString],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      api<MoviePage>(
        `/movies?${new URLSearchParams({ ...Object.fromEntries(params), offset: String(pageParam), limit: '20' })}`,
      ),
    getNextPageParam: (page) => page.meta.nextOffset ?? undefined,
  });
  const genres = useQuery({
    queryKey: ['genres'],
    queryFn: () => api<{ data: Genre[] }>('/genres'),
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = movies;
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage)
          void fetchNextPage({ cancelRefetch: false });
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const update = (name: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  };
  const allMovies = movies.data?.pages.flatMap((page) => page.data) ?? [];
  const total = movies.data?.pages[0]?.meta.total;
  return (
    <main>
      <section className={styles.hero}>
        <p className="eyebrow">Your next great watch</p>
        <h1>
          Stories worth <em>remembering.</em>
        </h1>
        <p className={styles.lede}>
          Explore a considered library of cinema, from enduring classics to tomorrow's favourites.
        </p>
        <label className={styles.search}>
          <Search size={20} />
          <span className="sr-only">Search movies or directors</span>
          <input
            value={params.get('q') ?? ''}
            onChange={(event) => update('q', event.target.value)}
            placeholder="Search movies or directors…"
          />
        </label>
      </section>
      <section className={styles.catalogue}>
        <div className={styles.heading}>
          <div>
            <p className="eyebrow">The collection</p>
            <h2>Browse all films</h2>
            <p className={styles.resultCount}>
              {total === undefined ? 'Loading collection…' : `${total} films found`}
            </p>
          </div>
          <SlidersHorizontal size={22} />
        </div>
        <div className={styles.filters}>
          <select
            aria-label="Filter by genre"
            value={params.get('genre') ?? ''}
            onChange={(event) => update('genre', event.target.value)}
          >
            <option value="">All genres</option>
            {genres.data?.data.map((genre) => (
              <option key={genre.id} value={genre.slug}>
                {genre.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Minimum rating"
            value={params.get('ratingMin') ?? ''}
            onChange={(event) => update('ratingMin', event.target.value)}
          >
            <option value="">Any rating</option>
            <option value="7">7+ rated</option>
            <option value="8">8+ rated</option>
            <option value="9">9+ rated</option>
          </select>
          <select
            aria-label="Sort films"
            value={params.get('sort') ?? 'title'}
            onChange={(event) => update('sort', event.target.value)}
          >
            <option value="title">Title A–Z</option>
            <option value="newest">Newest first</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>
        {movies.isLoading ? (
          <div className="movie-grid">
            {Array.from({ length: 10 }, (_, i) => (
              <div className={styles.skeleton} key={i} />
            ))}
          </div>
        ) : movies.isError ? (
          <div className="state">
            <h3>We couldn't load the collection.</h3>
            <button className="button button-primary" onClick={() => void movies.refetch()}>
              Try again
            </button>
          </div>
        ) : allMovies.length === 0 ? (
          <div className="state">
            <h3>No films match those filters.</h3>
            <button className="button button-quiet" onClick={() => setParams({})}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="movie-grid">
              {allMovies.map((movie) => (
                <MovieCard movie={movie} key={movie.id} />
              ))}
            </div>
            <div ref={sentinel} className={styles.loadMore}>
              {movies.hasNextPage ? (
                <button
                  className="button button-quiet"
                  disabled={movies.isFetchingNextPage}
                  onClick={() => void movies.fetchNextPage({ cancelRefetch: false })}
                >
                  {movies.isFetchingNextPage ? 'Loading…' : 'Load more'}
                </button>
              ) : (
                <p>You’ve reached the end of the collection.</p>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
