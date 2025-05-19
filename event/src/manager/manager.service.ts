import { Injectable, UnauthorizedException } from '@nestjs/common';
import eventConfigs, { EventDefinition } from '../config/event.config';
import { EventCreateDto } from '../dto/event-create.dto';
import { decodeJwtPayload } from '../utils/jwtdecode.util';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ManagerService {
  constructor(private readonly databaseService: DatabaseService) {}

  getEventOptions(): EventDefinition[] {
    return eventConfigs;
  }

  async createEvent(authHeader: string, dto: EventCreateDto) {
    const payload = decodeJwtPayload(authHeader);
    if (!payload || !payload.email) {
      throw new UnauthorizedException('유효한 토큰과 이메일이 필요합니다.');
    }

    const eventData = this.buildEventData(dto, payload.email);

    const savedEvent = await this.saveEvent(eventData);

    return {
      message: '이벤트가 성공적으로 생성되었습니다.',
      eventId: savedEvent.insertedId,
    };
  }

  private buildEventData(dto: EventCreateDto, email: string) {
    return {
      name: dto.name,
      description: dto.description || '',
      startAt: new Date(dto.startAt),
      periodInDays: dto.periodInDays,
      isActive: dto.isActive,
      conditions: dto.conditions,
      rewards: dto.rewards,
      createdAt: new Date(),
      createdBy: email,
    };
  }

  private async saveEvent(eventData: any) {
    const db = this.databaseService.getDb();
    return db.collection('events').insertOne(eventData);
  }
}
