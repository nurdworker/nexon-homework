import { Db } from 'mongodb';

export interface EventCondition {
  key: string;
  label: string;
  type: 'number' | 'string' | 'boolean';
  unit?: string;
}

export interface EventDefinition {
  type: string;
  name: string;
  description?: string;
  conditions: EventCondition[];
}

export interface EventConditionInstance {
  type: string; // 예: 'sign'
  key: string; // 예: 'days', 'duration'
  value: any; // 조건에 따라 타입 다를 수 있음
}

export interface EventReward {
  itemId: string;
  quantity: number;
}

export interface Event {
  _id: string; // MongoDB ObjectId (문자열로 저장됨)
  name: string;
  description?: string;
  startAt: Date;
  periodInDays: number;
  isActive: boolean;
  conditions: EventConditionInstance[];
  rewards: EventReward[];
  createdAt: Date;
  createdBy: string;
}

export const signValidators: Record<
  string,
  (
    db: Db,
    userId: string,
    condition: { key: string; value: number },
    event: Event,
  ) => Promise<boolean>
> = {
  async days(db, userId, condition, event) {
    console.log('[validator.days] 시작');
    const logs = db.collection('copiedTokenLogs');

    const start = new Date(event.startAt);
    const end = new Date(start);
    end.setDate(end.getDate() + event.periodInDays);
    console.log('[validator.days] 이벤트 기간 start:', start, ', end:', end);

    // 로그인한 날짜 리스트 구하기 (set으로 중복 제거)
    const loginDates = new Set<string>();

    const cursor = logs.find({
      userId,
      createdAt: { $gte: start, $lt: end },
      kind: { $in: ['refresh', 'access'] },
    });

    await cursor.forEach((log) => {
      const localDate = log.createdAt.toISOString().split('T')[0]; // yyyy-mm-dd
      loginDates.add(localDate);
      console.log('[validator.days] 로그:', log.createdAt, '->', localDate);
    });

    console.log('[validator.days] 로그인한 날짜들:', Array.from(loginDates));
    console.log(
      '[validator.days] 로그인 날짜 수:',
      loginDates.size,
      ', 조건 값:',
      condition.value,
    );

    const result = loginDates.size >= condition.value;
    console.log('[validator.days] 조건 충족 여부:', result);

    return result;
  },

  async duration(
    db: Db,
    userId: string,
    condition: { key: string; value: number },
    event: Event,
  ): Promise<boolean> {
    const start = new Date(event.startAt);
    const end = new Date(start);
    end.setDate(end.getDate() + event.periodInDays);

    const logs = db.collection('copiedSignLogs');
    const logEntries = await logs
      .find({
        userId,
        createdAt: { $gte: start, $lt: end },
      })
      .sort({ createdAt: 1 })
      .toArray();

    const sessions: { start: Date; end: Date }[] = [];
    let sessionStart: Date | null = null;
    let lastSignOut: Date | null = null;

    // 1. 첫 로그가 signOut이면, 이벤트 시작 시간부터 그 시간까지 세션 추가
    if (logEntries.length > 0 && logEntries[0].method === 'signOut') {
      sessions.push({ start, end: logEntries[0].createdAt });
    }

    for (const log of logEntries) {
      if (log.method === 'signIn') {
        // 현재 로그인 세션이 시작되지 않은 상태라면 (sessionStart가 null)
        if (sessionStart === null) {
          // 로그인 시작 시간 기록
          sessionStart = log.createdAt;
        }
        // 이미 로그인 세션이 시작된 상태이면서 마지막 로그아웃 시간(lastSignOut)이 있다면
        else if (lastSignOut !== null) {
          // 이전 세션 (로그인 시작 ~ 마지막 로그아웃) 을 sessions 배열에 저장
          sessions.push({ start: sessionStart, end: lastSignOut });
          // 새로운 로그인 세션 시작 시간 갱신
          sessionStart = log.createdAt;
          // 마지막 로그아웃 시간 초기화 (새 세션이므로 초기화)
          lastSignOut = null;
        }
      } else if (log.method === 'signOut') {
        // 로그아웃 로그인데, 로그인 세션이 시작된 상태라면
        if (sessionStart !== null) {
          // 마지막 로그아웃 시간을 기록 (하지만 아직 세션 종료 확정은 아님)
          lastSignOut = log.createdAt;
        }
      }
    }

    // 2. 마지막 로그가 signIn일 경우 이벤트 종료시간 또는 현재 시간까지 세션 추가
    if (sessionStart !== null) {
      const sessionEnd =
        lastSignOut ?? (end.getTime() < Date.now() ? end : new Date());
      sessions.push({ start: sessionStart, end: sessionEnd });
    }

    // 3. 모든 세션의 시간을 더함 (밀리초 단위)
    const totalMilliseconds = sessions.reduce((acc, session) => {
      return acc + (session.end.getTime() - session.start.getTime());
    }, 0);

    // 4. 밀리초 → 시간 단위 변환 (소수점 둘째 자리 반올림)
    const totalHours =
      Math.round((totalMilliseconds / (1000 * 60 * 60)) * 100) / 100;

    // 5. 조건 시간과 비교해서 true/false 반환
    return totalHours >= condition.value;
  },
};

// 📘 config는 조건 설명만 포함
const eventConfigs: EventDefinition[] = [
  {
    type: 'sign',
    name: '로그인 이벤트 조건건',
    description: '특정 로그인 조건을 만족한 사용자에게 지급하는 이벤트',
    conditions: [
      {
        key: 'duration',
        label: '총 로그인 누적 시간',
        type: 'number',
        unit: '시간',
      },
      {
        key: 'days',
        label: '누적 로그인 일수',
        type: 'number',
        unit: '일',
      },
    ],
  },
];

export default eventConfigs;
