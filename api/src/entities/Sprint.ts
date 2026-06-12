import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import is from 'utils/validation';
import { Issue, Project } from '.';

@Entity()
class Sprint extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(100)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('text', { nullable: true })
  goal: string | null;

  @Column('timestamp', { nullable: true })
  startDate: Date | null;

  @Column('timestamp', { nullable: true })
  endDate: Date | null;

  // planned | active | completed
  @Column('varchar', { default: 'planned' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(
    () => Project,
    project => project.sprints,
  )
  project: Project;

  @Column('integer')
  projectId: number;

  @OneToMany(
    () => Issue,
    issue => issue.sprint,
  )
  issues: Issue[];
}

export default Sprint;
