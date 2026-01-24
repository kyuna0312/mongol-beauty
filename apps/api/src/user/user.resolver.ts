import { Resolver, Query } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, { nullable: true })
  async me(): Promise<User | null> {
    // In a real app, get user from context/auth
    return null;
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    // Admin only - in production, add auth check
    return this.userService.findAll();
  }
}
