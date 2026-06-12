import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import is from 'utils/validation';
import { User, Project } from '.';

@Entity()
class Space extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(100)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

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

  @OneToMany(
    () => Project,
    project => project.space,
  )
  boards: Project[];
}

export default Space;
