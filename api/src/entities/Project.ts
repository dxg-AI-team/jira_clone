import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import is from 'utils/validation';
import { ProjectCategory } from 'constants/projects';
import { Issue, Space, ProjectVersion, Component } from '.';

@Entity()
class Project extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(100)],
    url: is.url(),
    category: [is.required(), is.oneOf(Object.values(ProjectCategory))],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  icon: string | null;

  @Column('varchar', { length: 2000, nullable: true })
  avatarUrl: string | null;

  @Column('varchar', { nullable: true })
  url: string | null;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('varchar')
  category: ProjectCategory;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => Issue,
    issue => issue.project,
  )
  issues: Issue[];

  @ManyToOne(
    () => Space,
    space => space.boards,
  )
  space: Space;

  @Column('integer', { nullable: true })
  spaceId: number;

  @OneToMany(
    () => ProjectVersion,
    version => version.project,
  )
  versions: ProjectVersion[];

  @OneToMany(
    () => Component,
    component => component.project,
  )
  components: Component[];
}

export default Project;
