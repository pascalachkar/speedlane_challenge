import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}
  async register(input: RegisterDto): Promise<{ user: AuthUser; token: string }> {
    const email = input.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } }))
      throw new ConflictException('An account with that email already exists');
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: input.displayName.trim(),
        passwordHash: await argon2.hash(input.password),
      },
      select: { id: true, email: true, displayName: true, role: true },
    });
    return { user, token: await this.sign(user) };
  }
  async login(emailInput: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const record = await this.prisma.user.findUnique({
      where: { email: emailInput.trim().toLowerCase() },
    });
    if (!record || !(await argon2.verify(record.passwordHash, password)))
      throw new UnauthorizedException('Invalid email or password');
    const user = {
      id: record.id,
      email: record.email,
      displayName: record.displayName,
      role: record.role,
    };
    return { user, token: await this.sign(user) };
  }
  private sign(user: AuthUser): Promise<string> {
    return this.jwt.signAsync({ sub: user.id, role: user.role });
  }
}
