import { Resolver, Mutation, Args, Query, Context, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User, UserType } from '../user/user.entity';

@ObjectType()
class AdminUser {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  isAdmin: boolean;
}

@ObjectType()
class LoginResponse {
  @Field()
  access_token: string;

  @Field(() => AdminUser)
  user: AdminUser;
}

@ObjectType()
class UserResponse {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  phone: string;

  @Field(() => UserType)
  userType: UserType;

  @Field()
  isAdmin: boolean;
}

@ObjectType()
class UserLoginResponse {
  @Field()
  access_token: string;

  @Field(() => UserResponse)
  user: UserResponse;
}

@ObjectType()
class MessageResponse {
  @Field()
  message: string;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async adminLogin(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    return this.authService.login(email, password);
  }

  @Mutation(() => User)
  async createAdmin(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
  ): Promise<User> {
    return this.authService.createAdmin(email, password, name);
  }

  @Query(() => User, { nullable: true })
  async adminMe(@Context() context: any): Promise<User | null> {
    const token = context.req?.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return null;
    }
    return this.authService.verifyToken(token);
  }

  // User registration
  @Mutation(() => User)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
    @Args('phone', { nullable: true }) phone?: string,
  ): Promise<User> {
    return this.authService.register(email, password, name, phone);
  }

  // User login
  @Mutation(() => UserLoginResponse)
  async userLogin(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<UserLoginResponse> {
    return this.authService.userLogin(email, password);
  }

  // Forgot password
  @Mutation(() => MessageResponse)
  async forgotPassword(@Args('email') email: string): Promise<MessageResponse> {
    return this.authService.forgotPassword(email);
  }

  // Reset password
  @Mutation(() => MessageResponse)
  async resetPassword(
    @Args('token') token: string,
    @Args('email') email: string,
    @Args('newPassword') newPassword: string,
  ): Promise<MessageResponse> {
    return this.authService.resetPassword(token, email, newPassword);
  }

  // Get current user (for any authenticated user)
  @Query(() => User, { nullable: true })
  async me(@Context() context: any): Promise<User | null> {
    const token = context.req?.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return null;
    }
    return this.authService.verifyToken(token);
  }

  // Update user subscription (admin only)
  @Mutation(() => User)
  async updateUserSubscription(
    @Args('userId') userId: string,
    @Args('userType', { type: () => UserType }) userType: UserType,
  ): Promise<User> {
    return this.authService.updateUserSubscription(userId, userType);
  }
}
