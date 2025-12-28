import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GeneralConfig, ContactChannel } from '@/shared/entities/general-config.entity';
import { User } from '@/shared/entities/user.entity';

@Injectable()
export class SeedGeneralConfigs {
  private readonly logger = new Logger(SeedGeneralConfigs.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding general configs...');

    const generalConfigRepository = this.dataSource.getRepository(GeneralConfig);
    const userRepo = this.dataSource.getRepository(User);

    // Check if general config already exist
    const existing = await generalConfigRepository.findOne({
      where: {} as any,
      order: { id: 'ASC' },
    });

    if (existing) {
      this.logger.log('General config already exists. Skipping seeding.');
      return;
    }

    // Get admin user for audit fields
    const adminUser = await userRepo.findOne({ where: { username: 'admin' } as any });
    const defaultUserId = adminUser?.id ?? 1;

    // Sample contact channels data
    const contactChannels: ContactChannel[] = [
      {
        type: 'zalo',
        value: '0123456789',
        label: 'Chat Zalo',
        icon: '/icons/zalo.png',
        url_template: 'https://zalo.me/{value}',
        enabled: true,
        sort_order: 1,
      },
      {
        type: 'messenger',
        value: 'your-page-id',
        label: 'Messenger',
        icon: '/icons/messenger.png',
        url_template: 'https://m.me/{value}',
        enabled: true,
        sort_order: 2,
      },
      {
        type: 'hotline',
        value: '19001234',
        label: 'Hotline',
        icon: '/icons/phone.png',
        url_template: 'tel:{value}',
        enabled: true,
        sort_order: 3,
      },
      {
        type: 'telegram',
        value: '@yourusername',
        label: 'Telegram',
        icon: '/icons/telegram.png',
        url_template: 'https://t.me/{value}',
        enabled: false,
        sort_order: 4,
      },
      {
        type: 'whatsapp',
        value: '84123456789',
        label: 'WhatsApp',
        icon: '/icons/whatsapp.png',
        url_template: 'https://wa.me/{value}',
        enabled: false,
        sort_order: 5,
      },
    ];

    const generalConfig = generalConfigRepository.create({
      site_name: 'My Website',
      site_description: 'Website mô tả',
      site_logo: null,
      site_favicon: null,
      site_email: 'contact@example.com',
      site_phone: '0123456789',
      site_address: '123 Đường ABC, Quận XYZ, TP.HCM',
      site_copyright: '© 2024 My Website. All rights reserved.',
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
      currency: 'VND',
      contact_channels: contactChannels,
      created_user_id: defaultUserId,
      updated_user_id: defaultUserId,
    });

    await generalConfigRepository.save(generalConfig);
    this.logger.log('General config seeding completed.');
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing general configs...');
    await this.dataSource.getRepository(GeneralConfig).clear();
  }
}
