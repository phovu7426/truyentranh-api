import { IsString, IsOptional, IsEmail, MaxLength, IsArray, IsBoolean, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ContactChannel } from '@/shared/entities/general-config.entity';

class ContactChannelDto implements ContactChannel {
  @IsString()
  type: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url_template?: string;

  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateGeneralConfigDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  site_name?: string;

  @IsString()
  @IsOptional()
  site_description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  site_logo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  site_favicon?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  site_email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  site_phone?: string;

  @IsString()
  @IsOptional()
  site_address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  site_copyright?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  timezone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  locale?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactChannelDto)
  contact_channels?: ContactChannel[];
}
