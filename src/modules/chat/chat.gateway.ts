import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { convertChatEntityToChatViewModel } from 'src/model/ChatListMapper';

@Injectable()
@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client);
      console.log('User connected:', userId);
      // When a user connects, send them the count of unread messages
      const unreadCount =
        await this.chatService.getAllUnreadMessagesCount(userId);
      client.emit('unreadMessageCount', unreadCount);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.connectedUsers.delete(userId as string);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() { otherUserId }: { otherUserId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.query.userId as string;
    const roomId = this.getRoomId(userId, otherUserId);

    client.join(roomId);
    client.emit('joinedRoom', roomId);

    const messages = await this.chatService.getMessagesForRoom(roomId);
    client.emit('loadMessages', messages);

    // Mark unread messages as read for this user when they join the room
    await this.chatService.markMessagesAsRead(roomId, userId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() { roomId, content }: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const senderId = client.handshake.query.userId as string;
    console.log('Sending message:', roomId, content);
    const recipientId = roomId.split('-').find((id) => id !== senderId);

    const recipientName = 'test';
    // Save the message as unread for the recipient
    const message = await this.chatService.saveMessage(
      roomId,
      senderId,
      recipientId,
      recipientName,
      content,
    );
    // Send the message to both participants
    console.log('recieve hier message:', content, roomId);
    this.server.to(roomId).emit('receiveMessage', message);

    // Notify the recipient if they are online
    const recipientSocket = this.connectedUsers.get(recipientId);
    if (recipientSocket && recipientSocket.id !== client.id) {
      recipientSocket.emit('newMessageNotification', {
        from: senderId,
        roomId,
        message: content,
      });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() { roomId }: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId = client.handshake.query.userId as string;
    // Mark messages as read for this user in the room
    await this.chatService.markMessagesAsRead(roomId, userId);
    const otherUserId = roomId.split('-').find((id) => id !== userId);
    const otherUserSocket = this.connectedUsers.get(otherUserId);
    if (otherUserSocket) {
      otherUserSocket.emit('messagesRead', { roomId, userId });
    }
  }

  @SubscribeMessage('getAllChats')
  async handleGetAllChats(@ConnectedSocket() client: Socket): Promise<void> {
    const userId = client.handshake.query.userId as string;
    const chats = await this.chatService.getAllChatsForUser(userId);
    const chatList = await chats.reduce(async (accPromise, chat) => {
      const acc = await accPromise;
      const recipients = await this.userService.getAllUsers();
      const recipient = await this.userService.findUserByPublicId(
        chat.recipientId,
      );
      console.log('recipient:', recipients, chat.recipientId);
      if (!recipient) {
        return acc;
      }
      const chatViewModel = convertChatEntityToChatViewModel(chat, recipient);
      return [...acc, chatViewModel];
    }, Promise.resolve([]));

    console.log('chat:', chatList);
    client.emit('allChats', chatList);
  }

  private getRoomId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('-');
  }
}
