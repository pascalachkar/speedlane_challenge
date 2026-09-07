const baseUrl = process.env.API_URL ?? 'http://127.0.0.1:3000/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...options.headers },
  });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}

function expectStatus(result, expected, label) {
  if (result.response.status !== expected) {
    throw new Error(
      `${label}: expected ${expected}, received ${result.response.status}: ${JSON.stringify(result.body)}`,
    );
  }
  console.info(`✓ ${label} (${expected})`);
}

async function login(email) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'Reelhouse123!' }),
  });
  expectStatus(result, 200, `login as ${email}`);
  return result.response.headers.get('set-cookie').split(';')[0];
}

const health = await request('/health');
expectStatus(health, 200, 'health check');

const movies = await request('/movies?offset=0&limit=5&sort=rating');
expectStatus(movies, 200, 'movie listing');
if (
  movies.body.data.length !== 5 ||
  movies.body.meta.total !== 200 ||
  movies.body.meta.nextOffset !== 5
)
  throw new Error('Movie pagination metadata is incorrect');
console.info('✓ offset pagination reports 200 total movies and nextOffset 5');

const genres = await request('/genres');
const directors = await request('/directors');
expectStatus(genres, 200, 'genre catalogue');
expectStatus(directors, 200, 'director catalogue');

const filtered = await request(
  `/movies?genre=${genres.body.data[0].slug}&yearFrom=1980&ratingMin=5&limit=3`,
);
expectStatus(filtered, 200, 'combined movie filters');

const anonymousWatchlist = await request('/watchlist');
expectStatus(anonymousWatchlist, 401, 'anonymous watchlist rejection');

const memberCookie = await login('member@reelhouse.test');
const memberMe = await request('/auth/me', { headers: { cookie: memberCookie } });
expectStatus(memberMe, 200, 'member session');

const moviePayload = {
  title: 'API Smoke Test Film',
  synopsis: 'A temporary film created by the automated real-database API smoke test.',
  releaseDate: '2026-09-07',
  runtimeMinutes: 101,
  contentRating: 'PG-13',
  posterUrl: 'https://placehold.co/600x900?text=Smoke+Test',
  averageRating: 8.2,
  directorIds: [directors.body.data[0].id],
  genreIds: [genres.body.data[0].id],
};
const forbiddenCreate = await request('/movies', {
  method: 'POST',
  headers: { cookie: memberCookie },
  body: JSON.stringify(moviePayload),
});
expectStatus(forbiddenCreate, 403, 'member admin-action rejection');

const adminCookie = await login('admin@reelhouse.test');
const created = await request('/movies', {
  method: 'POST',
  headers: { cookie: adminCookie },
  body: JSON.stringify(moviePayload),
});
expectStatus(created, 201, 'admin movie creation');
const movieId = created.body.data.id;

const updated = await request(`/movies/${movieId}`, {
  method: 'PATCH',
  headers: { cookie: adminCookie },
  body: JSON.stringify({ title: 'Updated API Smoke Test Film', averageRating: 8.7 }),
});
expectStatus(updated, 200, 'admin movie update');

const searched = await request('/movies?q=Updated%20API%20Smoke&limit=5');
expectStatus(searched, 200, 'movie search');
if (!searched.body.data.some((movie) => movie.id === movieId))
  throw new Error('Created movie was not returned by search');

const watchlistAdd = await request(`/watchlist/${movieId}`, {
  method: 'PUT',
  headers: { cookie: memberCookie },
});
expectStatus(watchlistAdd, 200, 'watchlist addition');
const watchlist = await request('/watchlist', { headers: { cookie: memberCookie } });
expectStatus(watchlist, 200, 'watchlist listing');
if (!watchlist.body.data.some((item) => item.movie.id === movieId))
  throw new Error('Movie was not present in member watchlist');

const watchlistRemove = await request(`/watchlist/${movieId}`, {
  method: 'DELETE',
  headers: { cookie: memberCookie },
});
expectStatus(watchlistRemove, 204, 'watchlist removal');
const removed = await request(`/movies/${movieId}`, {
  method: 'DELETE',
  headers: { cookie: adminCookie },
});
expectStatus(removed, 204, 'admin movie deletion');
const missing = await request(`/movies/${movieId}`);
expectStatus(missing, 404, 'deleted movie lookup');

console.info('All real-database API smoke checks passed.');
