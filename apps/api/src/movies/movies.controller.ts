import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { CreateMovieDto, MovieQueryDto, UpdateMovieDto } from './movie.dto';
import { MoviesService } from './movies.service';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly movies: MoviesService) {}
  @Public() @Get() list(@Query() query: MovieQueryDto) {
    return this.movies.list(query);
  }
  @Public() @Get(':idOrSlug') findOne(@Param('idOrSlug') value: string) {
    return this.movies.findOne(value);
  }
  @Roles(UserRole.ADMIN) @Post() create(
    @Body() body: CreateMovieDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.movies.create(body, user.id);
  }
  @Roles(UserRole.ADMIN) @Patch(':id') update(
    @Param('id') id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movies.update(id, body);
  }
  @Roles(UserRole.ADMIN) @HttpCode(204) @Delete(':id') remove(@Param('id') id: string) {
    return this.movies.remove(id);
  }
}
