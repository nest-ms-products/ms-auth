import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
}
