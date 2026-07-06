import {
  BaseEntity,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  RelationId,
} from 'typeorm';

import is from 'utils/validation';
import { User, Project } from '.';

@Entity()
// The project key is a short uppercase identifier unique across all projects
// (like a Jira project key), used to tell projects apart. Nullable in the
// schema so synchronize can add the column to existing rows; a startup backfill
// then assigns a unique key to every project.
@Index(['key'], { unique: true })
class Space extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(50)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar', { length: 10, nullable: true })
  key: string | null;

  @Column('varchar', { nullable: true })
  icon: string | null;

  @Column('varchar', { length: 2000, nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToMany(
    () => User,
    user => user.spaces,
  )
  @JoinTable()
  users: User[];

  // Space-level administrators (a subset of users). Independent of the global
  // User.role: a user can be a space admin here without being a global admin.
  @ManyToMany(() => User)
  @JoinTable({ name: 'space_admins_user' })
  admins: User[];

  @RelationId((space: Space) => space.admins)
  adminIds: number[];

  @OneToMany(
    () => Project,
    project => project.space,
  )
  boards: Project[];
}

export default Space;
