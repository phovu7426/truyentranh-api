import { Entity, Column, ManyToMany, JoinTable, Index, OneToOne } from 'typeorm';
import { UserStatus } from '@/shared/enums/user-status.enum';
import { Gender } from '@/shared/enums/gender.enum';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Profile } from './profile.entity';
import { BaseEntity } from './base.entity';

@Entity('users')
@Index('idx_deleted_at', ['deleted_at']) // Index cho soft delete
export class User extends BaseEntity {

  @Column({ length: 50, unique: true, nullable: true, type: 'varchar' })
  username?: string | null;

  @Column({ length: 255, unique: true, nullable: true, type: 'varchar' })
  email?: string | null;

  @Column({ length: 20, unique: true, nullable: true, type: 'varchar' })
  phone?: string | null;

  @Column({ length: 255, nullable: true, type: 'varchar' })
  password?: string | null;

  @Column({ type: 'varchar', length: 255, default: UserStatus.Active })
  status: UserStatus;

  @Column({ type: 'datetime', nullable: true })
  email_verified_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  phone_verified_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  last_login_at?: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  remember_token?: string | null;

  @ManyToMany(() => Role, (role) => role.users, { cascade: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles?: Role[];

  @ManyToMany(() => Permission, (permission) => permission.users, { cascade: false })
  @JoinTable({
    name: 'user_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  direct_permissions?: Permission[];

  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  profile?: Profile;
}
