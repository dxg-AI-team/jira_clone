import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // mention | assigned | comment | status | watch
  @Column('varchar')
  type: string;

  @Column('text')
  message: string;

  @Column('boolean', { default: false })
  isRead: boolean;

  // Recipient.
  @Column('integer')
  userId: number;

  // Who triggered it.
  @Column('integer', { nullable: true })
  actorId: number | null;

  // Related issue and the board it lives on (for routing on the client).
  @Column('integer', { nullable: true })
  issueId: number | null;

  @Column('integer', { nullable: true })
  projectId: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

export default Notification;
