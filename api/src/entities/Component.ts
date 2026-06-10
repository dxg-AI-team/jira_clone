import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';

import is from 'utils/validation';
import { Issue, Project } from '.';

@Entity()
class Component extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(100)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(
    () => Project,
    project => project.components,
  )
  project: Project;

  @Column('integer')
  projectId: number;

  @ManyToMany(
    () => Issue,
    issue => issue.components,
  )
  issues: Issue[];
}

export default Component;
