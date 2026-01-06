import { Module, forwardRef } from '@nestjs/common';
import { AdminContextController } from './controllers/context.controller';
import { AdminContextService } from './services/context.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    forwardRef(() => RbacModule),
  ],
  controllers: [AdminContextController],
  providers: [AdminContextService],
  exports: [AdminContextService],
})
export class AdminContextModule {}

