import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  RelationId,
} from 'typeorm';

import is from 'utils/validation';
import { Comment, Issue, Space } from '.';

@Entity()
class User extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(100)],
    email: [is.required(), is.email(), is.maxLength(200)],
    role: [is.oneOf(['admin', 'member'])],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar')
  email: string;

  @Column('varchar', { length: 2000 })
  avatarUrl: string;

  @Column('varchar', { default: 'member' })
  role: string;

  // Whether this user may create spaces (granted by a global admin). Global
  // admins can always create spaces regardless of this flag.
  @Column('boolean', { default: false })
  canCreateSpace: boolean;

  @Column('varchar', { length: 100, nullable: true })
  googleId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => Comment,
    comment => comment.user,
  )
  comments: Comment[];

  @ManyToMany(
    () => Issue,
    issue => issue.users,
  )
  issues: Issue[];

  @ManyToMany(
    () => Space,
    space => space.users,
  )
  spaces: Space[];

  @RelationId((user: User) => user.spaces)
  spaceIds: number[];
}

export default User;
