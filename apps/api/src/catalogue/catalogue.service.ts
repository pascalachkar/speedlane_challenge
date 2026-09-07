import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogueService {
  constructor(private readonly prisma: PrismaService) {}

  async listGenres() {
    return { data: await this.prisma.genre.findMany({ orderBy: { name: 'asc' } }) };
  }

  async listDirectors() {
    return { data: await this.prisma.director.findMany({ orderBy: { name: 'asc' } }) };
  }
}
