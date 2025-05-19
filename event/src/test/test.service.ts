import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TestService {
  constructor(private readonly databaseService: DatabaseService) {}

  testGet() {
    return { message: 'success api get from event' };
  }

  testRole() {
    return { message: 'success only user role api from event' };
  }

  testHeader(authHeader: string) {
    console.log('[event] 토큰 받아서 뜯어봤어~:', authHeader);

    try {
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      const payload = jwt.decode(token);
      console.log('[event] 디코딩된 payload:', payload);
      return { message: 'Decoded JWT payload', payload };
    } catch (error) {
      console.error('[event] JWT 디코딩 실패:', error);
      return { message: 'Invalid token' };
    }
  }

  async getAllItems() {
    const db = this.databaseService.getDb(); // 몽고 커넥션 가져오기
    const items = await db.collection('copiedItems').find().toArray();
    return { message: 'success', items };
  }
}
