export interface EventConfig {
  dbUri: string;
  dbUriUser: string;
  dbName: string;
  userName: string;
  password: string;
  maxPoolSize: number;
  minPoolSize: number;
  initCollectionLists: readonly string[];
  testSecret: string;
}

export const eventConfig = {
  dbUri: 'mongodb://event-db:27017',
  dbUriUser: 'mongodb://eventService:test123@event-db:27017/eventDb?authSource=eventDb',
  dbName: 'eventDb',
  userName: 'eventService',
  password: 'test123',
  maxPoolSize: 10,
  minPoolSize: 1,
  initCollectionLists: ['eventLists', 'requestLists', 'copiedUsers', 'copiedTokenLogs'] as const,
  testSecret: 'muzzi',
} as const satisfies EventConfig;
