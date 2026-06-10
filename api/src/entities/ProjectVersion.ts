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
class ProjectVersion extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(100)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('timestamp', { nullable: true })
  releaseDate: Date | null;

  @Column('boolean', { default: false })
  released: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(
    () => Project,
    project => project.versions,
  )
  project: Project;

  @Column('integer')
  projectId: number;

  @OneToMany(
    () => Issue,
    issue => issue.version,
  )
  issues: Issue[];
}

export default ProjectVersion;
