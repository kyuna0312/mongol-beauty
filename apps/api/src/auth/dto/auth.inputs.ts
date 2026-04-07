import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

@InputType()
export class AdminLoginInput {
  @Field()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

@InputType()
export class UserLoginInput {
  @Field()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: 'password must contain at least one letter' })
  @Matches(/[0-9]/, { message: 'password must contain at least one number' })
  password: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  @IsEmail()
  @MaxLength(320)
  email: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  token: string;

  @Field()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Za-z]/, { message: 'password must contain at least one letter' })
  @Matches(/[0-9]/, { message: 'password must contain at least one number' })
  newPassword: string;
}
