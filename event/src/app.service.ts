import { DatabaseService } from './database/database.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  getHello(): string {
    return 'Hello from event';
  }

  postBye(body: { name: string }): string {
    return `Bye ${body.name}`;
  }

  // 1) /event : 전체 이벤트 목록, 최신순 (createdAt desc)
  async getEventsList(): Promise<any[]> {
    const db: Db = await this.databaseService.connect();
    const events = db.collection('events');
    const copiedItems = db.collection('copiedItems');

    // 1) 이벤트 목록 조회 (기본 필드 + rewards)
    const result = await events
      .find(
        {},
        {
          projection: {
            name: 1,
            startAt: 1,
            periodInDays: 1,
            isActive: 1,
            rewards: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray();

    // 2) 모든 rewards의 itemId 모으기 (중복 제거)
    const allItemIds = new Set<string>();
    result.forEach((event) => {
      (event.rewards ?? []).forEach((reward) => allItemIds.add(reward.itemId));
    });

    // 3) copiedItems에서 아이템 이름 조회
    const items = await copiedItems
      .find({
        _id: { $in: Array.from(allItemIds).map((id) => new ObjectId(id)) },
      })
      .project({ name: 1 })
      .toArray();

    // 4) itemId -> name 맵 생성
    const itemNameMap = new Map<string, string>();
    items.forEach((item) => {
      itemNameMap.set(item._id.toHexString(), item.name);
    });

    // 5) 각 이벤트의 rewards에 itemName 필드 추가
    const resultWithNames = result.map((event) => ({
      ...event,
      rewards: (event.rewards ?? []).map((reward) => ({
        ...reward,
        itemName: itemNameMap.get(reward.itemId) || '알 수 없는 아이템',
      })),
    }));

    return resultWithNames;
  }

  // 2) /event/:eventId : eventId로 특정 이벤트 조회
  async getEventById(eventId: string): Promise<any> {
    if (!ObjectId.isValid(eventId)) {
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다.');
    }

    const db: Db = await this.databaseService.connect();
    const events = db.collection('events');
    const copiedItems = db.collection('copiedItems');

    // 1. 이벤트 기본 정보 조회 (conditions, createdAt, createdBy 제외)
    const event = await events.findOne(
      { _id: new ObjectId(eventId) },
      {
        projection: {
          conditions: 0,
          createdAt: 0,
          createdBy: 0,
        },
      },
    );

    if (!event) {
      throw new NotFoundException('해당 이벤트를 찾을 수 없습니다.');
    }

    // 2. rewards 배열에서 itemId 목록 추출
    const itemIds = event.rewards.map((reward) => new ObjectId(reward.itemId));

    // 3. copiedItems 컬렉션에서 아이템 이름 조회
    const items = await copiedItems
      .find({ _id: { $in: itemIds } })
      .project({ name: 1 })
      .toArray();

    // 4. itemId별 name 매핑 만들기
    const itemNameMap = new Map<string, string>();
    for (const item of items) {
      itemNameMap.set(item._id.toHexString(), item.name);
    }

    // 5. rewards 배열에 itemName 필드 추가
    event.rewards = event.rewards.map((reward) => ({
      ...reward,
      itemName: itemNameMap.get(reward.itemId) || '알 수 없는 아이템',
    }));

    return event;
  }
}
