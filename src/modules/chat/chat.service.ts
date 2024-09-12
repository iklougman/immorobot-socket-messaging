import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository, UpdateResult } from 'typeorm';
import { Chat, Message } from '../../entities/mongodb/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat, 'mongoConnection')
    private readonly chatRepository: Repository<Chat>,
  ) {}

  private async createNewChat(
    roomId: string,
    creatorId: string,
    recipientId: string,
    recipientName: string,
    firstMessage: Message,
  ): Promise<Message> {
    const newChat = new Chat();
    newChat.roomId = roomId;
    newChat.creatorId = creatorId;
    newChat.recipientId = recipientId;
    newChat.recipientName = recipientName;
    newChat.lastMessageContent = firstMessage.content;
    newChat.lastMessageTimestamp = new Date();
    newChat.lastMessageRead = false;
    newChat.messages = [firstMessage]; // Add the first message to the messages array

    await this.chatRepository.insert(newChat);

    return firstMessage;
  }
  // TODO construct return value to match expected type
  // Helper method to add a message to an existing chat
  private async addMessageToChat(
    chat: Chat,
    newMessage: Message,
  ): Promise<Message> {
    const result = await this.chatRepository.update(
      { _id: chat._id },
      { messages: [...chat.messages, newMessage] },
    );

    if (!result.affected) {
      throw new Error('Failed to add message to chat');
    }

    return newMessage;
  }

  // Save a new message and mark it as unread for the recipient
  async saveMessage(
    roomId: string,
    senderId: string,
    recipientId: string,
    recipientName: string,
    content: string,
  ): Promise<Message> {
    const chat = await this.chatRepository.findOne({ where: { roomId } });
    const newMessage = new Message({
      senderId,
      content,
      read: false,
      timestamp: new Date(),
    });
    if (!chat) {
      return this.createNewChat(
        roomId,
        senderId,
        recipientId,
        recipientName,
        newMessage,
      );
    }

    return this.addMessageToChat(chat, newMessage);
  }

  // Get all messages in a specific room
  async getMessagesForRoom(roomId: string): Promise<Message[]> {
    const messages = await this.chatRepository.findOne({
      where: { roomId },
      select: ['messages'],
      order: { createdAt: 'ASC' },
    });
    return messages ? messages.messages : [];
  }

  // Mark all messages in a room as read for a specific user
  async markMessagesAsRead(
    roomId: string,
    userId: string,
  ): Promise<UpdateResult> {
    const chat = await this.chatRepository.findOne({ where: { roomId } });

    if (!chat) {
      return;
    }

    const updatedMessages = chat.messages.map((message) => {
      if (message.senderId !== userId) {
        message.read = true;
      }
      return message;
    });

    const result = await this.chatRepository.update(
      { _id: chat._id },
      { messages: updatedMessages },
    );
    return result;
  }

  // Get the count of unread messages for a user
  async getAllUnreadMessagesCount(userId: string): Promise<number> {
    const count = await this.chatRepository.count({
      where: {
        messages: {
          senderId: userId,
          read: false,
        },
      },
    });
    return count;
  }

  async getAllChatsForUser(userId: string): Promise<Chat[]> {
    const chatList: Chat[] = await this.chatRepository.find({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      where: { $or: [{ creatorId: userId }, { recipientId: userId }] },
      order: { createdAt: 'DESC' },
    });

    return chatList;
  }
}
