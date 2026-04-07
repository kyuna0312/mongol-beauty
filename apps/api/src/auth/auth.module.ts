import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { User } from '../user/user.entity';
import { EmailService } from '../common/services/email.service';
import { GqlOptionalAuthGuard } from '../common/guards/gql-optional-auth.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from '../common/guards/gql-admin.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (process.env.NODE_ENV === 'production' && !secret) {
          throw new Error('JWT_SECRET is required in production');
        }
        return {
          secret: secret || 'dev-only-jwt-secret-change-me',
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    EmailService,
    GqlOptionalAuthGuard,
    GqlJwtAuthGuard,
    GqlAdminGuard,
  ],
  exports: [AuthService, GqlOptionalAuthGuard, GqlJwtAuthGuard, GqlAdminGuard],
})
export class AuthModule {}
