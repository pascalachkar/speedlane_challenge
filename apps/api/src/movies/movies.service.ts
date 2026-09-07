import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto, MovieQueryDto, UpdateMovieDto } from './movie.dto';

const include = {
  directors: { include: { director: true }, orderBy: { creditOrder: 'asc' as const } },
  genres: { include: { genre: true } },
};
@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}
  async list(query: MovieQueryDto) {
    const where: Prisma.MovieWhereInput = {
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              {
                directors: {
                  some: { director: { name: { contains: query.q, mode: 'insensitive' } } },
                },
              },
            ],
          }
        : {}),
      ...(query.genre ? { genres: { some: { genre: { slug: query.genre } } } } : {}),
      ...(query.yearFrom || query.yearTo
        ? {
            releaseDate: {
              ...(query.yearFrom ? { gte: new Date(Date.UTC(query.yearFrom, 0, 1)) } : {}),
              ...(query.yearTo ? { lt: new Date(Date.UTC(query.yearTo + 1, 0, 1)) } : {}),
            },
          }
        : {}),
      ...(query.ratingMin !== undefined ? { averageRating: { gte: query.ratingMin } } : {}),
    };
    const orderBy: Prisma.MovieOrderByWithRelationInput =
      query.sort === 'newest'
        ? { releaseDate: 'desc' }
        : query.sort === 'rating'
          ? { averageRating: 'desc' }
          : { title: 'asc' };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({
        where,
        include,
        orderBy,
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.movie.count({ where }),
    ]);
    const nextOffset = query.offset + data.length;
    return {
      data,
      meta: {
        offset: query.offset,
        limit: query.limit,
        total,
        hasMore: nextOffset < total,
        nextOffset: nextOffset < total ? nextOffset : null,
      },
    };
  }
  async findOne(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idOrSlug,
    );
    const movie = await this.prisma.movie.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include,
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return { data: movie };
  }
  async create(input: CreateMovieDto, userId: string) {
    return { data: await this.prisma.movie.create({ data: this.toData(input, userId), include }) };
  }
  async update(id: string, input: UpdateMovieDto) {
    await this.assertExists(id);
    const scalar = {
      ...(input.title
        ? { title: input.title, slug: `${this.slugify(input.title)}-${id.slice(0, 8)}` }
        : {}),
      ...(input.synopsis ? { synopsis: input.synopsis } : {}),
      ...(input.releaseDate ? { releaseDate: new Date(input.releaseDate) } : {}),
      ...(input.runtimeMinutes ? { runtimeMinutes: input.runtimeMinutes } : {}),
      ...(input.contentRating !== undefined ? { contentRating: input.contentRating } : {}),
      ...(input.posterUrl ? { posterUrl: input.posterUrl } : {}),
      ...(input.backdropUrl !== undefined ? { backdropUrl: input.backdropUrl } : {}),
      ...(input.averageRating !== undefined ? { averageRating: input.averageRating } : {}),
    };
    return {
      data: await this.prisma.movie.update({
        where: { id },
        data: {
          ...scalar,
          ...(input.directorIds
            ? {
                directors: {
                  deleteMany: {},
                  create: input.directorIds.map((directorId, creditOrder) => ({
                    directorId,
                    creditOrder,
                  })),
                },
              }
            : {}),
          ...(input.genreIds
            ? {
                genres: {
                  deleteMany: {},
                  create: [...new Set(input.genreIds)].map((genreId) => ({ genreId })),
                },
              }
            : {}),
        },
        include,
      }),
    };
  }
  async remove(id: string): Promise<void> {
    await this.assertExists(id);
    await this.prisma.movie.delete({ where: { id } });
  }
  private async assertExists(id: string) {
    if (!(await this.prisma.movie.findUnique({ where: { id }, select: { id: true } })))
      throw new NotFoundException('Movie not found');
  }
  private toData(input: CreateMovieDto, userId: string): Prisma.MovieCreateInput {
    return {
      title: input.title.trim(),
      slug: `${this.slugify(input.title)}-${crypto.randomUUID().slice(0, 8)}`,
      synopsis: input.synopsis.trim(),
      releaseDate: new Date(input.releaseDate),
      runtimeMinutes: input.runtimeMinutes,
      contentRating: input.contentRating,
      posterUrl: input.posterUrl,
      backdropUrl: input.backdropUrl,
      averageRating: input.averageRating,
      createdBy: { connect: { id: userId } },
      directors: {
        create: input.directorIds.map((directorId, creditOrder) => ({ directorId, creditOrder })),
      },
      genres: { create: [...new Set(input.genreIds)].map((genreId) => ({ genreId })) },
    };
  }
  private slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
