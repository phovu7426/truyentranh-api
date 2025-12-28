import { Module } from '@nestjs/common';
import { RbacCacheService } from '@/modules/rbac/services/rbac-cache.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '@/shared/entities/role.entity';
import { Permission } from '@/shared/entities/permission.entity';
import { User } from '@/shared/entities/user.entity';
import { RbacService } from '@/modules/rbac/services/rbac.service';
import { RbacController } from '@/modules/rbac/controllers/rbac.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User])],
  providers: [RbacService, RbacCacheService],
  controllers: [RbacController],
  exports: [RbacService, RbacCacheService, TypeOrmModule],
})
export class RbacModule { }


