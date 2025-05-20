export interface Manager {
  email: string;
  nickName: string;
  roles: ('user' | 'operator' | 'auditor' | 'admin')[];
  createdAt: Date;
}

export interface CollectionIndexConfig {
  name: string;
  indexFields: readonly string[];
}

export interface SettingConfig {
  dbUri: string;
  dbUriUser: string;
  dbName: string;
  userName: string;
  password: string;
  maxPoolSize: number;
  minPoolSize: number;
  initCollectionLists: readonly CollectionIndexConfig[];
  initItems: readonly string[];
  testSecret: string;
  managerLists: readonly Manager[];
}

export const settingConfig = {
  dbUri: 'mongodb://event-db:27017',
  dbUriUser:
    'mongodb://eventService:test123@event-db:27017/eventDb?authSource=eventDb',
  dbName: 'eventDb',
  userName: 'eventService',
  password: 'test123',
  maxPoolSize: 10,
  minPoolSize: 1,
  initCollectionLists: [
    {
      name: 'events',
      indexFields: ['name', 'producerId', 'createdAt'],
    },
    {
      name: 'requests',
      indexFields: ['eventId', 'userId'],
    },
    {
      name: 'copiedItems',
      indexFields: [],
    },
    {
      name: 'copiedUsers',
      indexFields: ['userId', 'email', 'nickName'],
    },
    {
      name: 'copiedTokenLogs',
      indexFields: ['userId', 'createdAt'],
    },
    {
      name: 'copiedSignLogs',
      indexFields: ['userId', 'createdAt'],
    },
  ] as const,
  initItems: ['자쿰의 투구', '공 10노목', '덱 30가운'] as const,
  testSecret: 'muzzi',
  managerLists: [
    {
      email: 'bera@nexon.com',
      nickName: '베라GM',
      roles: ['user', 'operator'],
      createdAt: new Date(),
    },
    {
      email: 'croa@nexon.com',
      nickName: '크로아GM',
      roles: ['user', 'auditor'],
      createdAt: new Date(),
    },
    {
      email: 'union@nexon.com',
      nickName: '유니온GM',
      roles: ['user', 'operator', 'auditor'],
      createdAt: new Date(),
    },
    {
      email: 'elysium@nexon.com',
      nickName: '엘리시움GM',
      roles: ['user', 'admin'],
      createdAt: new Date(),
    },
  ],
} as const satisfies SettingConfig;
