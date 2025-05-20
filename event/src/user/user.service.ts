import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { DatabaseService } from '../database/database.service';
import { signValidators, Event } from '../config/event.config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async requestEvent(eventId: string, authHeader: string): Promise<any> {
    console.log('[1] eventId:', eventId);
    // 1. eventId 유효성 검사
    if (!ObjectId.isValid(eventId)) {
      console.log('[1-1] 유효하지 않은 이벤트 ID');
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다.');
    }

    const db: Db = await this.databaseService.connect();
    const events = db.collection('events');
    const requests = db.collection('requests');

    // 2. 해당 이벤트 존재 여부 확인
    const event = await events.findOne<Event>({ _id: new ObjectId(eventId) });
    if (!event) {
      console.log('[2-1] 이벤트 미존재');
      throw new NotFoundException('이벤트가 존재하지 않습니다.');
    }

    // 3. isActive 확인
    if (!event.isActive) {
      console.log('[3-1] 이벤트 비활성화');
      throw new ForbiddenException('이벤트가 비활성화 상태입니다.');
    }

    // 4. 현재 날짜가 이벤트 진행기간에 포함되는지 확인
    const now = new Date();
    const start = new Date(event.startAt);
    const end = new Date(start);
    end.setDate(end.getDate() + event.periodInDays);

    if (now < start || now >= end) {
      console.log('[4-1] 이벤트 기간 아님');
      throw new ForbiddenException('이벤트 진행 기간이 아닙니다.');
    }

    // 4-1. 유저 정보 찾기
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const payload = jwt.decode(token) as { email: string };
    console.log('[4-2] 디코딩된 페이로드:', payload);
    const user = await db
      .collection('copiedUsers')
      .findOne({ email: payload.email });

    if (!user || !user.userId) {
      console.log('[4-4] 사용자 ID 미발견');
      throw new NotFoundException(
        '해당 이메일에 대한 사용자 ID를 찾을 수 없습니다.',
      );
    }

    const userId = user.userId;
    // 4-2. 기존 요청 이력 확인
    const existing = await requests.findOne({
      eventId,
      userId,
      isSatisfied: true,
    });
    console.log('[4-5] 기존 요청:', existing);

    if (existing) {
      console.log('[4-6] 이미 보상 획득');

      await db.collection('requests').insertOne({
        eventId,
        userId,
        isSatisfied: true,
        isReceived: false,
        description: '이미 보상을 받은 이벤트트',
        createdAt: new Date(),
      });

      return {
        message: '이미 보상을 받으셨는데요?',
        description: '욕심이 많으시군요?',
      };
    }

    let isSatisfied = true;
    let description = '';

    // 5. 이벤트 조건 검증 (모든 조건을 순회하며 검증)
    if (Array.isArray(event.conditions)) {
      for (const condition of event.conditions) {
        console.log('[5] 조건:', condition);
        if (condition.type === 'sign') {
          const validator = signValidators[condition.key];
          if (!validator) {
            console.log('[5-1] 지원하지 않는 조건 키:', condition.key);
            throw new BadRequestException(
              `지원하지 않는 조건 키입니다: ${condition.key}`,
            );
          }

          const isValid = await validator(db, userId, condition, event);
          console.log('[5-2] 조건 검증 결과:', isValid);
          if (!isValid) {
            isSatisfied = false;

            // 설명 메시지 구성
            if (condition.key === 'days') {
              description = `로그인 일수가 ${condition.value}일 이상이어야 합니다.`;
            } else if (condition.key === 'duration') {
              const hours = condition.value;
              description = `누적 접속 시간이 ${hours}시간 이상이어야 합니다.`;
            } else {
              description = '이벤트 조건이 충족되지 않았습니다.';
            }

            break;
          }
        }
      }
    }
    if (isSatisfied) {
      description = '여기 보상 받으세요~!';
    }

    // 6. 요청 내역 저장
    await db.collection('requests').insertOne({
      eventId: event._id.toString(),
      userId: userId,
      isSatisfied,
      isReceived: isSatisfied,
      description,
      createdAt: new Date(),
    });

    // 7. 응답 반환
    if (isSatisfied) {
      return {
        message: '이벤트 조건이 충족되었습니다. 아이템을 획득하셨습니다.',
        rewards: event.rewards,
        description,
      };
    } else {
      return {
        message: '이벤트 조건이 충족되지 않았습니다.',
        description,
      };
    }
  }

  async getMyEventRequests(authHeader: string): Promise<any> {
    const db: Db = await this.databaseService.connect();

    // 1. JWT 토큰 파싱
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const payload = jwt.decode(token) as { email: string };
    if (!payload?.email) {
      throw new BadRequestException('유효하지 않은 토큰입니다.');
    }

    // 2. 이메일로 userId 찾기
    const user = await db
      .collection('copiedUsers')
      .findOne({ email: payload.email });
    if (!user || !user.userId) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const userId = user.userId;

    // 3. 요청 내역 가져오기
    const requests = await db
      .collection('requests')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      userId,
      total: requests.length,
      requests,
    };
  }
}
