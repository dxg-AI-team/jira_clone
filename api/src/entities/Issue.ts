import striptags from 'striptags';
import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  RelationId,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

import is from 'utils/validation';
import { IssueType, IssueStatus, IssuePriority } from 'constants/issues';
import { Comment, Project, User, ProjectVersion, Component, Sprint } from '.';

@Entity()
class Issue extends BaseEntity {
  static validations = {
    title: [is.required(), is.maxLength(200)],
    type: [is.required(), is.oneOf(Object.values(IssueType))],
    // status is a board column key (configurable per board), so only require it.
    status: [is.required()],
    priority: [is.required(), is.oneOf(Object.values(IssuePriority))],
    listPosition: is.required(),
    reporterId: is.required(),
  };

  @PrimaryGeneratedColumn()
  id: number;

  // Per-board sequential issue number. Combined with the board key it forms the
  // issue key (e.g. ABC-12). Nullable so synchronize can add it to existing
  // rows; a startup backfill assigns numbers to legacy issues.
  @Column('integer', { nullable: true })
  number: number | null;

  @Column('varchar')
  title: string;

  @Column('varchar')
  type: IssueType;

  @Column('varchar')
  status: IssueStatus;

  // Reason captured when the issue is moved to the board's "done" column.
  @Column('text', { nullable: true })
  resolution: string | null;

  @Column('varchar')
  priority: IssuePriority;

  @Column('double precision')
  listPosition: number;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('text', { nullable: true })
  descriptionText: string | null;

  @Column('integer', { nullable: true })
  estimate: number | null;

  @Column('integer', { nullable: true })
  timeSpent: number | null;

  @Column('integer', { nullable: true })
  timeRemaining: number | null;

  @Column('integer', { nullable: true })
  storyPoints: number | null;

  @Column('timestamp', { nullable: true })
  dueDate: Date | null;

  @Column('simple-array', { nullable: true })
  labels: string[];

  @Column('integer', { nullable: true })
  parentId: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('integer')
  reporterId: number;

  @ManyToOne(
    () => Project,
    project => project.issues,
  )
  project: Project;

  @Column('integer')
  projectId: number;

  @ManyToOne(
    () => ProjectVersion,
    version => version.issues,
    { nullable: true, onDelete: 'SET NULL' },
  )
  version: ProjectVersion | null;

  @Column('integer', { nullable: true })
  versionId: number | null;

  @ManyToOne(
    () => Sprint,
    sprint => sprint.issues,
    { nullable: true, onDelete: 'SET NULL' },
  )
  sprint: Sprint | null;

  @Column('integer', { nullable: true })
  sprintId: number | null;

  @OneToMany(
    () => Comment,
    comment => comment.issue,
  )
  comments: Comment[];

  @ManyToMany(
    () => User,
    user => user.issues,
  )
  @JoinTable()
  users: User[];

  @RelationId((issue: Issue) => issue.users)
  userIds: number[];

  @ManyToMany(
    () => Component,
    component => component.issues,
  )
  @JoinTable()
  components: Component[];

  @RelationId((issue: Issue) => issue.components)
  componentIds: number[];

  @ManyToMany(() => User)
  @JoinTable({ name: 'issue_watchers_user' })
  watchers: User[];

  @RelationId((issue: Issue) => issue.watchers)
  watcherIds: number[];

  @BeforeInsert()
  @BeforeUpdate()
  setDescriptionText = (): void => {
    if (this.description) {
      this.descriptionText = striptags(this.description);
    }
  };
}

export default Issue;
