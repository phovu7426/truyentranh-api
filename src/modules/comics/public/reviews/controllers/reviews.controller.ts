import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PublicReviewsService } from '@/modules/comics/public/reviews/services/reviews.service';

@Controller('public/reviews')
export class PublicReviewsController {
  constructor(private readonly reviewsService: PublicReviewsService) { }

  @Get('comics/:comicId')
  async getByComic(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.reviewsService.getByComic(comicId, page, limit);
  }
}

