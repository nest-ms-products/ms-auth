import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config/envs';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  constructor(private jwtService: JwtService) {
    super();
  }
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async signJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });
      return {
        user,
        token: await this.signJwtToken(user),
      };
    } catch (error) {
      throw new RpcException(new BadRequestException(error.message));
    }
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: __, ...rest } = user;
    return {
      user: rest,
      token: await this.signJwtToken({ ...rest }),
    };
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: __, ...rest } = user;
    return {
      user: rest,
      token: await this.signJwtToken({ ...rest }),
    };
  }
}
