import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { StatsService } from '@/modules/comics/public/stats/services/stats.service';

@Controller('public/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) { }

  @Get('comics/:comicId')
  async getComicStats(@Param('comicId', ParseIntPipe) comicId: number) {
    return this.statsService.getComicStats(comicId);
  }
}

