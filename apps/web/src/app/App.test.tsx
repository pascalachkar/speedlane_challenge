import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MovieCard } from '../components/MovieCard';

describe('MovieCard', () => {
  it('renders an accessible movie link and metadata', () => {
    render(
      <MemoryRouter>
        <MovieCard
          movie={{
            id: '1',
            slug: 'arrival',
            title: 'Arrival',
            synopsis: 'Test synopsis',
            releaseDate: '2016-01-01',
            runtimeMinutes: 116,
            posterUrl: '/poster.jpg',
            averageRating: '8.1',
            directors: [{ director: { id: 'd1', name: 'Denis Villeneuve', slug: 'denis' } }],
            genres: [],
          }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/movies/arrival');
    expect(screen.getByText(/2016.*Denis Villeneuve/)).toBeVisible();
    expect(screen.getByAltText('Poster for Arrival')).toBeVisible();
  });
});
