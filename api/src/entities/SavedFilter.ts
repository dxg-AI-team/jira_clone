import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

import is from 'utils/validation';

@Entity()
class SavedFilter extends BaseEntity {
  static validations = {
    name: [is.required(), is.maxLength(100)],
  };

  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar')
  name: string;

  // JSON-serialized filter criteria from the Issues & Filters page.
  @Column('text')
  criteria: string;

  // Scoped to a board and owner.
  @Column('integer')
  projectId: number;

  @Column('integer')
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

export default SavedFilter;
