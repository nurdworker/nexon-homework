import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService, SignUpInfo, SignInInfo } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('signup')
  async signUp(@Body() signUpInfo: SignUpInfo) {
    return await this.appService.signUp(signUpInfo);
  }

  @Post('signin')
  async signIn(@Body() signInInfo: SignInInfo) {
    return await this.appService.signIn(signInInfo);
  }

  @Post('refresh')
  async refresh(@Headers('authorization') authHeader: string) {
    if (!authHeader)
      throw new UnauthorizedException('Refresh token이 필요합니다.');
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    return await this.appService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader)
      throw new UnauthorizedException('Refresh token이 필요합니다.');
    const refreshToken = authHeader.replace('Bearer ', '').trim();
    return await this.appService.logout(refreshToken);
  }
}
