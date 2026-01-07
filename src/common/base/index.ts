/**
 * Base Module Exports
 */

// Core
// (no core exports right now)

// Services
export {
  PrismaListService,
  PrismaCrudService,
} from '@/common/base/services';

// Types
export { Filters, Options, PaginatedListResult } from '@/common/base/interfaces';
export {
  PrismaListOptions,
  PrismaListResult,
} from '@/common/base/services';

// Utils
export { toPlain, buildOrderBy } from '@/common/base/services';
// Note: ResponseInterceptor has been removed as it was redundant with TransformInterceptor
// All response transformations are now handled by TransformInterceptor in src/common/interceptors/


