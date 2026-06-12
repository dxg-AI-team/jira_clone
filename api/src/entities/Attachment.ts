import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Issue } from '.';

@Entity()
class Attachment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  originalName: string;

  @Column('varchar')
  mimeType: string;

  @Column('integer')
  size: number;

  // Base64-encoded file contents. Kept out of list responses; only the
  // download endpoint reads it.
  @Column('text')
  data: string;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' })
  issue: Issue;

  @Column('integer')
  issueId: number;

  @Column('integer')
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

export default Attachment;
