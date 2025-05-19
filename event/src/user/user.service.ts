import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getDashboard() {
    return { message: '유저용 대시보드입니다.' };
  }
}
