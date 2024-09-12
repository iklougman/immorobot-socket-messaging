import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/postgresql/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User], 'postgresConnection')],
  providers: [UserService],
})
export class UserModule {}
