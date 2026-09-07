import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { CatalogueService } from './catalogue.service';

@ApiTags('catalogue')
@Controller()
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  @Public()
  @Get('genres')
  @ApiOperation({ summary: 'List the available movie genres' })
  genres() {
    return this.catalogueService.listGenres();
  }

  @Public()
  @Get('directors')
  @ApiOperation({ summary: 'List the available movie directors' })
  directors() {
    return this.catalogueService.listDirectors();
  }
}
