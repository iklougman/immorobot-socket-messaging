import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ObjectId } from 'mongodb';

export class Message {
  @ObjectIdColumn()
  _id: ObjectId = new ObjectId(); // MongoDB ObjectID for the message

  @Column()
  senderId: string; // ID of the user who sent the message

  @Column()
  content: string; // The message content

  @Column({ default: false })
  read: boolean; // Read/unread status

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);
  }
}

@Entity('chats')
export class Chat extends BaseEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  roomId: string;

  @Column()
  creatorId: string;

  @Column()
  recipientId: string;

  @Column()
  recipientName: string;

  @Column(() => Message)
  messages: Message[] = [];

  @Column({ nullable: true })
  lastMessageContent: string;

  @UpdateDateColumn({ nullable: true })
  lastMessageTimestamp: Date;

  @Column({ default: false })
  lastMessageRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
