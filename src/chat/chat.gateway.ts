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
import { Message } from './message.entity';
import { Injectable, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const apiKey = client.handshake.query.apiKey;
    if (apiKey !== this.configService.get<string>('API_KEY')) {
      client.disconnect();
    } else {
      client.emit('connected', 'Successfully connected to WebSocket');
    }
  }

  handleDisconnect(client: Socket) {
    // Handle disconnect logic if needed
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() { roomId }: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    client.join(roomId);
    client.emit('joinedRoom', roomId);
    const messages = await this.chatService.getMessagesForRoom(roomId);
    client.emit('loadMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() { roomId, content }: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const senderId = client.id; // You can use client.id or another identifier
    const recipientId = roomId.split('-').find((id) => id !== senderId);
    const message = await this.chatService.saveMessage(
      roomId,
      senderId,
      recipientId,
      content,
    );
    this.server.to(roomId).emit('receiveMessage', message);
  }
}
