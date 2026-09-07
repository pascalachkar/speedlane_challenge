import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const movieInclude = {
  genres: { include: { genre: true } },
  directors: {
    include: { director: true },
    orderBy: { creditOrder: 'asc' as const },
  },
};

@Injectable()
export class WatchlistService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.watchlistItem.findMany({
      where: { userId },
      include: { movie: { include: movieInclude } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: items };
  }

  async add(userId: string, movieId: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });
    if (!movie) throw new NotFoundException('Movie not found');

    const item = await this.prisma.watchlistItem.upsert({
      where: { userId_movieId: { userId, movieId } },
      create: { userId, movieId },
      update: {},
    });
    return { data: item };
  }

  async remove(userId: string, movieId: string): Promise<void> {
    await this.prisma.watchlistItem.deleteMany({ where: { userId, movieId } });
  }
}
