import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';

@Entity()
export class BlogsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: string;
  @Column()
  isMembership: boolean;
}
