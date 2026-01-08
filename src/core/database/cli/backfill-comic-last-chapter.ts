import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { PUBLIC_CHAPTER_STATUSES } from '@/shared/enums';

async function backfillComicLastChapter() {
  const logger = new Logger('BackfillComicLastChapter');
  
  try {
    logger.log('🚀 Starting backfill comic last chapter data...');

    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const prisma = app.get(PrismaService);

    // Lấy tất cả comics (không bị xóa)
    const comics = await prisma.comic.findMany({
      where: { deleted_at: null },
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    logger.log(`📊 Found ${comics.length} comics to process...`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const comic of comics) {
      try {
        // Tìm chapter mới nhất (published, không bị xóa)
        const lastChapter = await prisma.chapter.findFirst({
          where: {
            comic_id: comic.id,
            status: { in: PUBLIC_CHAPTER_STATUSES },
            deleted_at: null,
          },
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            created_at: true,
          },
        });

        // Update comic
        await prisma.comic.update({
          where: { id: comic.id },
          data: {
            last_chapter_id: lastChapter?.id || null,
            last_chapter_updated_at: lastChapter?.created_at || null,
          },
        });

        if (lastChapter) {
          updated++;
        } else {
          skipped++;
        }

        processed++;

        // Log progress mỗi 100 comics
        if (processed % 100 === 0) {
          logger.log(`⏳ Processed: ${processed}/${comics.length} (Updated: ${updated}, Skipped: ${skipped})`);
        }
      } catch (error) {
        logger.error(`❌ Error processing comic ${comic.id}: ${error.message}`);
      }
    }

    logger.log(`✅ Backfill completed!`);
    logger.log(`   Total processed: ${processed}`);
    logger.log(`   Updated (with last chapter): ${updated}`);
    logger.log(`   Skipped (no published chapters): ${skipped}`);

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

backfillComicLastChapter();

