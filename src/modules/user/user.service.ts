import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/postgresql/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'postgresConnection')
    private readonly userRepository: Repository<User>,
  ) {}
  async getAllUsers() {
    return this.userRepository.find();
  }
  async findUserByPublicId(publicId: string) {
    return this.userRepository.findOne({ where: { publicId } });
  }
}
