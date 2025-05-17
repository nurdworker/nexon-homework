import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  constructor() {}

  testGet() {
    return { message: 'success api get from event' };
  }
}
