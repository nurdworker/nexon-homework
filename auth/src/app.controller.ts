import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
