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
