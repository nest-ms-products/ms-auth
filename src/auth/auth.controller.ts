import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessages } from 'src/common/enums/messages-tcp.enum';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthMessages.Register)
  registerUser() {
    return {
      message: 'User registered',
    };
  }

  @MessagePattern(AuthMessages.Login)
  loginUser() {
    return {
      message: 'User logged in',
    };
  }

  @MessagePattern(AuthMessages.Verify)
  vaerifyToken() {
    return {
      message: 'Token verified',
    };
  }
}
