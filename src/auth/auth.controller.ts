import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthMessages } from 'src/common/enums/messages-tcp.enum';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthMessages.Register)
  registerUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
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
