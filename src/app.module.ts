import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './modules/chat/chat.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make configuration available globally
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app',
      entities: [__dirname + '/**/entities/mongodb/*.entity{.ts,.js}'],
      synchronize: true,
      useUnifiedTopology: true,
      name: 'mongoConnection',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.POSTGRES_URL,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      entities: [__dirname + '/**/entities/postgresql/*.entity{.ts,.js}'],
      name: 'postgresConnection',
      // synchronize: true,
    }),
    ChatModule,
    UserModule,
  ],
})
export class AppModule {}
