import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import is from 'utils/validation';
import { Issue } from '.';

export const LINK_TYPES = ['blocks', 'is_blocked_by', 'relates', 'duplicates', 'is_duplicated_by'];

@Entity()
class IssueLink extends BaseEntity {
  static validations = {
    type: [is.required(), is.oneOf(LINK_TYPES)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  type: string;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' })
  sourceIssue: Issue;

  @Column('integer')
  sourceIssueId: number;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' })
  targetIssue: Issue;

  @Column('integer')
  targetIssueId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

export default IssueLink;
