import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity()
export class Message {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  roomId: string;

  @Column()
  senderId: string;

  @Column()
  recipientId: string;

  @Column()
  content: string;

  @Column()
  timestamp: Date;
}
