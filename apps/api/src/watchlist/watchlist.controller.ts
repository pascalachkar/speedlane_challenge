import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { WatchlistService } from './watchlist.service';

@ApiTags('watchlist')
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated user's watchlist" })
  list(@CurrentUser() user: AuthUser) {
    return this.watchlistService.list(user.id);
  }

  @Put(':movieId')
  @ApiOperation({ summary: 'Add a movie to the watchlist' })
  add(
    @CurrentUser() user: AuthUser,
    @Param('movieId', new ParseUUIDPipe({ version: '4' })) movieId: string,
  ) {
    return this.watchlistService.add(user.id, movieId);
  }

  @HttpCode(204)
  @Delete(':movieId')
  @ApiOperation({ summary: 'Remove a movie from the watchlist' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('movieId', new ParseUUIDPipe({ version: '4' })) movieId: string,
  ) {
    return this.watchlistService.remove(user.id, movieId);
  }
}
