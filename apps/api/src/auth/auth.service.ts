import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserType } from '../user/user.entity';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isAdmin: true },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string): Promise<{ access_token: string; user: any }> {
    const user = await this.validateAdmin(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    };
  }

  async createAdmin(email: string, password: string, name: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Admin user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      isAdmin: true,
      userType: UserType.ADMIN,
    });

    return this.userRepository.save(admin);
  }

  /**
   * Validates a JWT and returns the corresponding user (any role).
   * Use this for `me`, optional auth on product queries, etc.
   */
  async validateAccessToken(token: string | undefined | null): Promise<User | null> {
    if (!token?.trim()) {
      return null;
    }
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      return await this.userRepository.findOne({
        where: { id: payload.sub },
      });
    } catch {
      return null;
    }
  }

  async loadUserWithOrders(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
  }

  // User registration
  async register(email: string, password: string, name: string, phone?: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or phone already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      userType: UserType.USER,
      isAdmin: false,
    });

    return this.userRepository.save(user);
  }

  // User login (not just admin)
  async userLogin(email: string, password: string): Promise<{ access_token: string; user: any }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, sub: user.id, userType: user.userType };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.userType,
        isAdmin: user.isAdmin,
      },
    };
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    user.passwordResetToken = await bcrypt.hash(resetToken, 10);
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    // Send email with reset link
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send password reset email:', error);
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  // Reset password
  async resetPassword(token: string, email: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    // Verify token
    const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
    if (!isValidToken) {
      throw new BadRequestException('Invalid reset token');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }

  // Update user subscription status (admin only)
  async updateUserSubscription(userId: string, userType: UserType): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userType === UserType.ADMIN) {
      throw new BadRequestException('Cannot set user type to ADMIN via this method');
    }

    user.userType = userType;
    // Keep isAdmin in sync (only true for ADMIN type)
    user.isAdmin = false;

    return this.userRepository.save(user);
  }
}
