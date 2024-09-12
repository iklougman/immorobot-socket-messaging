import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/entities/mongodb/chat.entity';
import { User } from 'src/entities/postgresql/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'postgresConnection'),
    TypeOrmModule.forFeature([Chat], 'mongoConnection'),
  ],
  providers: [ChatGateway, ChatService, UserService],
})
export class ChatModule {}
