import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  getSuccessMessage() {
    return { message: 'success api get' };
  }
}
