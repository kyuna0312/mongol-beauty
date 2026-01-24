import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
  }

  async findByPhone(phone: string): Promise<User> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ['orders'],
    });
  }

  async createOrFind(phone?: string, name?: string): Promise<User> {
    if (!phone) {
      const user = this.userRepository.create({ name });
      return this.userRepository.save(user);
    }

    let user = await this.findByPhone(phone);
    if (!user) {
      user = this.userRepository.create({ phone, name });
      return this.userRepository.save(user);
    }

    if (name && user.name !== name) {
      user.name = name;
      return this.userRepository.save(user);
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['orders'],
      order: { createdAt: 'DESC' },
    });
  }
}
