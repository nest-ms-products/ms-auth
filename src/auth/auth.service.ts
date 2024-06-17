import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const isUserExist = await this.user.findFirst({
      where: {
        email: registerUserDto.email,
      },
    });

    if (isUserExist) {
      throw new RpcException(new BadRequestException('User already exists'));
    }

    const user = await this.user.create({
      data: {
        name: registerUserDto.name,
        email: registerUserDto.email,
        password: bcrypt.hashSync(registerUserDto.password, 10),
      },
    });

    return user;
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new RpcException(new BadRequestException('Invalid credentials'));
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) {
      throw new RpcException(new BadRequestException('Invalid credentials'));
    }

    return user;
  }
}
