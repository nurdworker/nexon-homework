import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagerService {
  getDashboard() {
    return { message: '매니저용 대시보드입니다.' };
  }
}
