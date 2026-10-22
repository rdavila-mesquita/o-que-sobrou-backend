import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-request';
import { Public } from '../common/decorators/public.decorator';
import { SignInDTO, SignUpDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private authService: AuthService
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() body: SignUpDTO) {

    return this.authService.signup(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() body: SignInDTO) {

    return this.authService.signin(body);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}

