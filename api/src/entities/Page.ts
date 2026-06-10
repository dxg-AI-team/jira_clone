import striptags from 'striptags';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import is from 'utils/validation';
import { Project } from '.';

@Entity()
class Page extends BaseEntity {
  static validations = {
    title: [is.required(), is.maxLength(200)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  title: string;

  @Column('text', { nullable: true })
  content: string | null;

  @Column('text', { nullable: true })
  contentText: string | null;

  @Column('integer', { nullable: true })
  parentPageId: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Project)
  project: Project;

  @Column('integer')
  projectId: number;

  @BeforeInsert()
  @BeforeUpdate()
  setContentText = (): void => {
    if (this.content) {
      this.contentText = striptags(this.content);
    }
  };
}

export default Page;
