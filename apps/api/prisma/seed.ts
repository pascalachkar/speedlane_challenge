import { PrismaClient, UserRole } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const genres = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'History',
  'Horror',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'Western',
];
const firstNames = [
  'Avery',
  'Mara',
  'Theo',
  'Elena',
  'Jonah',
  'Iris',
  'Felix',
  'Nora',
  'Mateo',
  'Cleo',
];
const lastNames = [
  'Aster',
  'Bennett',
  'Choi',
  'Diallo',
  'Ellis',
  'Farouk',
  'Gupta',
  'Hale',
  'Ito',
  'Jensen',
];
const adjectives = [
  'Silent',
  'Golden',
  'Last',
  'Hidden',
  'Distant',
  'Crimson',
  'Electric',
  'Forgotten',
  'Midnight',
  'Infinite',
  'Broken',
  'Velvet',
  'Burning',
  'Northern',
  'Secret',
];
const subjects = [
  'Horizon',
  'Archive',
  'Passenger',
  'Garden',
  'Signal',
  'Kingdom',
  'River',
  'Memory',
  'Orbit',
  'Portrait',
  'Harbour',
  'Machine',
  'Season',
  'Promise',
  'Frontier',
  'Labyrinth',
  'Echo',
  'Voyage',
];

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function seed(): Promise<void> {
  if (process.env.SEED_IF_EMPTY === 'true' && (await prisma.movie.count()) > 0) {
    console.info('Database already contains movies; skipping the initial seed.');
    return;
  }

  await prisma.watchlistItem.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.movieDirector.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.director.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('Reelhouse123!');
  const [admin, member] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@reelhouse.test',
        displayName: 'Reelhouse Admin',
        passwordHash,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: 'member@reelhouse.test',
        displayName: 'Demo Member',
        passwordHash,
      },
    }),
  ]);
  const createdGenres = await Promise.all(
    genres.map((name) => prisma.genre.create({ data: { name, slug: slugify(name) } })),
  );
  const directorNames = Array.from(
    { length: 50 },
    (_, index) =>
      `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length)]}`,
  );
  const createdDirectors = await Promise.all(
    directorNames.map((name, index) =>
      prisma.director.create({ data: { name, slug: `${slugify(name)}-${index + 1}` } }),
    ),
  );

  for (let index = 0; index < 200; index += 1) {
    const title = `${adjectives[index % adjectives.length]} ${subjects[(index * 7) % subjects.length]}`;
    const uniqueTitle =
      index >= adjectives.length * subjects.length ? `${title} ${index + 1}` : title;
    const director = createdDirectors[(index * 3) % createdDirectors.length]!;
    const genreA = createdGenres[index % createdGenres.length]!;
    const genreB = createdGenres[(index + 5) % createdGenres.length]!;
    await prisma.movie.create({
      data: {
        title: uniqueTitle,
        slug: `${slugify(uniqueTitle)}-${index + 1}`,
        synopsis: `A distinctive story about ${subjects[(index + 3) % subjects.length]!.toLowerCase()}, courage, and the choices that change us. Film ${index + 1} in the Reelhouse collection.`,
        releaseDate: new Date(Date.UTC(1970 + (index % 56), index % 12, 1 + (index % 27))),
        runtimeMinutes: 78 + ((index * 7) % 85),
        contentRating: ['G', 'PG', 'PG-13', 'R'][index % 4],
        posterUrl: `https://placehold.co/600x900/171920/d8b56e?text=${encodeURIComponent(uniqueTitle)}`,
        backdropUrl: `https://placehold.co/1600x900/171920/d8b56e?text=${encodeURIComponent(uniqueTitle)}`,
        averageRating: 5 + ((index * 13) % 46) / 10,
        createdById: admin.id,
        directors: { create: [{ directorId: director.id, creditOrder: 0 }] },
        genres: { create: [{ genreId: genreA.id }, { genreId: genreB.id }] },
      },
    });
  }
  const initialMovies = await prisma.movie.findMany({ take: 8, orderBy: { title: 'asc' } });
  await prisma.watchlistItem.createMany({
    data: initialMovies.map((movie) => ({ userId: member.id, movieId: movie.id })),
  });
  console.info(
    `Seeded ${await prisma.movie.count()} movies, ${createdDirectors.length} directors, and ${createdGenres.length} genres.`,
  );
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
