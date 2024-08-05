import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async saveMessage(
    roomId: string,
    senderId: string,
    recipientId: string,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      roomId,
      senderId,
      recipientId,
      content,
      timestamp: new Date(),
    });
    return this.messageRepository.save(message);
  }

  async getMessagesForRoom(roomId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { roomId },
      order: { timestamp: 'ASC' },
    });
  }
}
