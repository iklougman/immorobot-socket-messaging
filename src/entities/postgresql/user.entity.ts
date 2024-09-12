import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  publicId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
