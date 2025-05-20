import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import eventConfigs, { EventDefinition } from '../config/event.config';
import { EventCreateDto } from '../dto/event-create.dto';
import { decodeJwtPayload } from '../utils/jwtdecode.util';
import { DatabaseService } from '../database/database.service';
import { Db, ObjectId } from 'mongodb';
import ExcelJS from 'exceljs';

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

  async toggleActive(eventId: string): Promise<any> {
    if (!ObjectId.isValid(eventId)) {
      throw new BadRequestException('유효하지 않은 이벤트 ID입니다.');
    }

    const db: Db = await this.databaseService.connect();
    const events = db.collection('events');

    const event = await events.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      throw new NotFoundException('해당 이벤트를 찾을 수 없습니다.');
    }

    const newIsActive = !event.isActive;

    await events.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { isActive: newIsActive } },
    );

    return {
      eventId,
      message: newIsActive
        ? '이벤트가 활성화되었습니다.'
        : '이벤트가 비활성화되었습니다.',
    };
  }

  // requests 컬렉션 데이터 모두 반환
  async getAllRequests() {
    const db: Db = await this.databaseService.connect();
    const requests = await db
      .collection('requests')
      .find()
      .sort({ createdAt: 1 })
      .toArray();
    return requests;
  }

  // requests 컬렉션 데이터를 엑셀 파일로 만들어서 Buffer 반환
  async exportRequestsExcel(): Promise<Buffer> {
    const db: Db = await this.databaseService.connect();

    // 모든 요청 조회
    const requests = await db
      .collection('requests')
      .find()
      .sort({ createdAt: 1 })
      .toArray();

    // 이벤트 ID 모음 (중복 제거)
    const eventIds = [
      ...new Set(requests.map((r) => r.eventId).filter((id) => id)),
    ];

    // 사용자 ID 모음 (중복 제거)
    const userIds = [
      ...new Set(requests.map((r) => r.userId).filter((id) => id)),
    ];

    // 이벤트명 조회 (events 컬렉션)
    const events = await db
      .collection('events')
      .find({ _id: { $in: eventIds.map((id) => new ObjectId(id)) } })
      .toArray();

    // 사용자 정보 조회 (copiedUsers 컬렉션)
    const users = await db
      .collection('copiedUsers')
      .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
      .toArray();

    // 이벤트와 사용자 맵 생성
    const eventMap = new Map(events.map((ev) => [ev._id.toString(), ev.name]));
    const userMap = new Map(
      users.map((u) => [
        u._id.toString(),
        { nickName: u.nickName, email: u.email },
      ]),
    );

    // 엑셀 워크북, 시트 생성
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Requests');

    // 컬럼 정의
    sheet.columns = [
      { header: '_id', key: '_id', width: 24 },
      { header: 'eventId', key: 'eventId', width: 24 },
      { header: 'eventName', key: 'eventName', width: 30 },
      { header: 'userId', key: 'userId', width: 24 },
      { header: 'userNickName', key: 'userNickName', width: 20 },
      { header: 'userEmail', key: 'userEmail', width: 30 },
      { header: 'isSatisfied', key: 'isSatisfied', width: 12 },
      { header: 'description', key: 'description', width: 30 },
      { header: 'createdAt', key: 'createdAt', width: 24 },
    ];

    // 데이터 추가
    requests.forEach((req) => {
      const eventName = req.eventId ? eventMap.get(req.eventId) || '' : '';
      const userInfo = req.userId ? userMap.get(req.userId) : undefined;

      sheet.addRow({
        _id: req._id.toString(),
        eventId: req.eventId,
        eventName,
        userId: req.userId,
        userNickName: userInfo ? userInfo.nickName : '',
        userEmail: userInfo ? userInfo.email : '',
        isSatisfied: req.isSatisfied !== undefined ? req.isSatisfied : '',
        description: req.description || '',
        createdAt: req.createdAt ? new Date(req.createdAt).toISOString() : '',
      });
    });

    // 엑셀 파일 버퍼 생성 및 반환
    const bufferData = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(bufferData);
    return buffer;
  }
}
