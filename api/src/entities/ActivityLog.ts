import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Issue, User } from '.';

@Entity()
class ActivityLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // created | status | assigned | field | comment | link | attachment
  @Column('varchar')
  action: string;

  @Column('text')
  detail: string;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' })
  issue: Issue;

  @Column('integer')
  issueId: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User | null;

  @Column('integer', { nullable: true })
  userId: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

export default ActivityLog;
