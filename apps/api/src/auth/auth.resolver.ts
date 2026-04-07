import { Resolver, Mutation, Args, Query, Context, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { User, UserType } from '../user/user.entity';
import { GqlOptionalAuthGuard } from '../common/guards/gql-optional-auth.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import {
  AdminLoginInput,
  UserLoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './dto/auth.inputs';

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

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Mutation(() => LoginResponse)
  async adminLogin(@Args('input') input: AdminLoginInput): Promise<LoginResponse> {
    return this.authService.login(input.email, input.password);
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlOptionalAuthGuard)
  async adminMe(@Context() context: any): Promise<User | null> {
    const user = context.req?.user as User | null;
    if (!user?.isAdmin) {
      return null;
    }
    return user;
  }

  // User registration
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Mutation(() => User)
  async register(@Args('input') input: RegisterInput): Promise<User> {
    return this.authService.register(input.email, input.password, input.name, input.phone);
  }

  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Mutation(() => UserLoginResponse)
  async userLogin(@Args('input') input: UserLoginInput): Promise<UserLoginResponse> {
    return this.authService.userLogin(input.email, input.password);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Mutation(() => MessageResponse)
  async forgotPassword(@Args('input') input: ForgotPasswordInput): Promise<MessageResponse> {
    return this.authService.forgotPassword(input.email);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Mutation(() => MessageResponse)
  async resetPassword(@Args('input') input: ResetPasswordInput): Promise<MessageResponse> {
    return this.authService.resetPassword(input.token, input.email, input.newPassword);
  }

  // Get current user (for any authenticated user)
  @Query(() => User, { nullable: true })
  @UseGuards(GqlOptionalAuthGuard)
  async me(@Context() context: any): Promise<User | null> {
    const u = context.req?.user as User | null;
    if (!u) {
      return null;
    }
    return this.authService.loadUserWithOrders(u.id);
  }

  // Update user subscription (admin only)
  @Mutation(() => User)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async updateUserSubscription(
    @Args('userId') userId: string,
    @Args('userType', { type: () => UserType }) userType: UserType,
  ): Promise<User> {
    return this.authService.updateUserSubscription(userId, userType);
  }
}
