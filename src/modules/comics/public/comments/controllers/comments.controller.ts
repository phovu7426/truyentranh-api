import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicCommentsService } from '@/modules/comics/public/comments/services/comments.service';

@Controller('public/comments')
export class PublicCommentsController {
  constructor(private readonly commentsService: PublicCommentsService) { }

  @Get('comics/:comicId')
  async getByComic(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.commentsService.getByComic(comicId, page, limit);
  }

  @Get('chapters/:chapterId')
  async getByChapter(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.commentsService.getByChapter(chapterId, page, limit);
  }
}

