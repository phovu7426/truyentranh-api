import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisUtil } from '@/core/utils/redis.util';

@Injectable()
export class RbacCacheService {
  private readonly ttlSeconds: number;
  private readonly versionKey = 'rbac:version';

  constructor(
    private readonly redis: RedisUtil,
    private readonly configService: ConfigService,
  ) {
    this.ttlSeconds = Number(this.configService.get('RBAC_CACHE_TTL') || 300);
  }

  private userPermsKey(userId: number, version: number): string {
    return `rbac:user:${userId}:v${version}`;
  }

  async getVersion(): Promise<number> {
    if (!this.redis.isEnabled()) return 1;
    const val = await this.redis.get(this.versionKey);
    const num = val ? Number(val) : 1;
    return Number.isFinite(num) && num > 0 ? num : 1;
  }

  async bumpVersion(): Promise<void> {
    if (!this.redis.isEnabled()) return;
    const current = await this.getVersion();
    await this.redis.set(this.versionKey, String(current + 1));
  }

  async getUserPermissions(userId: number): Promise<Set<string> | null> {
    if (!this.redis.isEnabled()) return null;
    const version = await this.getVersion();
    const raw = await this.redis.get(this.userPermsKey(userId, version));
    if (!raw) return null;
    try {
      const arr = JSON.parse(raw) as string[];
      return new Set(arr);
    } catch {
      return null;
    }
  }

  async setUserPermissions(userId: number, permissions: Iterable<string>): Promise<void> {
    if (!this.redis.isEnabled()) return;
    const version = await this.getVersion();
    const arr = Array.from(new Set(permissions));
    await this.redis.set(this.userPermsKey(userId, version), JSON.stringify(arr), this.ttlSeconds);
  }

  async invalidateUser(userId: number): Promise<void> {
    // With versioning, simplest is to bump version globally to invalidate all users immediately
    // If you want per-user invalidation without global bump, store index of versions and delete specific keys (more complex)
    await this.bumpVersion();
  }
}


