# API 명세서

### **공통사항**

- 기본경로 : [http://localhost:3000](http://localhost:3000/event/manager/requests/export) (docker compose 파일 api-gw서비스 포트, 필요시 수정 하셔서 사용하세요~)
- 기본 토큰 헤더 설정 : Authorization / Bearer
- 기본 POST요청 : Body raw JSON형식

---

### 관리자 계정 목록

| 이메일                                        | 비밀번호 | 닉네임     | 역할(RBAC)        |
| --------------------------------------------- | -------- | ---------- | ----------------- |
| [bera@nexon.com](mailto:bera@nexon.com)       | test123  | 베라GM     | operator          |
| [croa@nexon.com](mailto:croa@nexon.com)       | test123  | 크로아GM   | auditor           |
| [union@nexon.com](mailto:union@nexon.com)     | test123  | 유니온GM   | operator, auditor |
| [elysium@nexon.com](mailto:elysium@nexon.com) | test123  | 엘리시움GM | admin             |

- /auth/signUp이나 /auth/signIn으로 로그인 하시면 응답으로 토큰이 옵니다.
- 토큰 정보를 복사하셔서 인증이 필요한 API요청 테스트에 사용하시면 됩니다~

---

### API 목차

- 인덱스(Idx) 보시고 필요한 곳에 가셔서 갖다 쓰세요~
- role에서 public이란 뜻은 모두 접속 가능하다는 뜻입니다. (역할 검사 안 함)

| **Idx** | **경로**                     | **HTTP 메서드** | **설명**                                                                                  | **역할(RBAC)**           | **토큰 필요?** | **서비스** |
| ------- | ---------------------------- | --------------- | ----------------------------------------------------------------------------------------- | ------------------------ | -------------- | ---------- |
| 1       | /auth/signup                 | POST            | 회원 가입 API                                                                             | public                   | ❌             | auth       |
| 2       | /auth/signin                 | POST            | 로그인 API                                                                                | public                   | ❌             | auth       |
| 3       | /auth/logout                 | POST            | 로그아웃 API                                                                              | public                   | ✅             | auth       |
| 4       | /auth/refresh                | POST            | 토큰 갱신 API                                                                             | public                   | ✅             | auth       |
|         |                              |                 |                                                                                           |                          |                |            |
| 5       | /event/lists                 | GET             | 이벤트 목록 보기 API                                                                      | public                   | ❌             | event      |
| 6       | /event/list/:eventId         | GET             | 특정 이벤트 상세 보기 API                                                                 | public                   | ❌             | event      |
| 7       | /event/manager/option        | GET             | 이벤트 조건 옵션 조회. 이벤트 생성 전에 생성할 수 있는 이벤트 종류 데이터 받는 API입니다. | operator, admin          | ✅             | event      |
| 8       | /event/manager               | POST            | 이벤트 생성하는 API                                                                       | operator, admin          | ✅             | event      |
| 9       | /event/manager/toggle-active | POST            | 이벤트 활성화&비활성화 API                                                                | operator, admin          | ✅             | event      |
| 10      | /event/manager/requests      | GET             | 전체 유저 보상 요청 기록 조회                                                             | operator, admin, auditor | ✅             | event      |
| 11      | /event/user/request          | POST            | 보상 요청 API (이벤트 검증하고 아이템 받음)                                               | user                     | ✅             | event      |
| 12      | /event/user/request/me       | GET             | 내 보상 요청 기록 확인 API                                                                | user                     | ✅             | event      |

## API요청 상세 정보

### 💡1번💡 /auth/signup (POST)

```yaml
http://localhost:3000/auth/signup
```

- 설명 : 회원 가입 API입니다.
- 역할 : 누구나 보낼 수 있는 api
- 토큰 필요 유무 : ❌
- 요청 Body 예시

```json
{
  "email": "muzzi@nexon.com",
  "password": "test123",
  "nickName": "무찌"
}
```

- 응답 예시:

```json
{
  "nickName": "무찌",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im11enppQG5leG9uLmNvbSIsIm5pY2tOYW1lIjoi66y07LCMIiwicm9sZXMiOlsidXNlciJdLCJpYXQiOjE3NDc3MDcxODMsImV4cCI6MTc0NzcwODk4M30.mAsQbJGrRmbMXdSriErDErrWFHMJiXhu8xHZjQAz5qgVgvmbho8pVNhf4px9guV3gjVDVWiR8zSret1M0OTuGjGmfLgC6HUxwh8Q0Q51R5MqCPenP52Dw-FYQXQ9VWqzmIfJBj1ZuOj61XVjp8YlyVv0dKpE8iu-8GprBQ3YkZBJbtYMvE5L9Up5-jrADJrpmA42Sd_ueti6c0XrR7h3wXr-4yRBwCP1q474_ZLBoCqpXbnNZBX7W48Uf_w1fJfad6fsb21FSFfaTGLwug05gX8ja8P4TE3Gk01Yg824ZFfLTw8OUro6jCnWG7_RLLU6WKptU25NABVYwM3BUkUQbw",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im11enppQG5leG9uLmNvbSIsIm5pY2tOYW1lIjoi66y07LCMIiwicm9sZXMiOlsidXNlciJdLCJpYXQiOjE3NDc3MDcxODMsImV4cCI6MTc0ODkxNjc4M30.LeuvCkONdtsK6uKKa7WoZ6jA5vXR8cBXCqmc5e7Lk-CT__Tn2k0k5HloW_z8k8Mnm4PavQdFkDP8ORU3aMkvMTDnj-QAKG71PqAaQyM4htqn00fTq5NW95IobINVXulaE4Qb76MLh9IQczSGJRNn85ngbMBvpCPyfxct_X629M5htzLseOiwZDPh8eB6w0mT6nii8Ip3CFk3_mSCSLER1wUlp4nePDsMeVtBAxGoqftH99XihEJUrNzeMntdZX2rGIS3SUXlwzn5c5YPIsrrhJidRvFWhvrKdr-N827a0VppFBARJDaAukNplPQ72RgYVLly0iVC3-fiYLU6OG9nSA"
}
```

**추가정보**

- 응답 받은 토큰으로 각 RBAC기능을 테스트 해보세요~!
- 유저 계정을 하나 만들고 테스트 해보세요~

### 💡2번💡 /auth/signin (POST)

```yaml
http://localhost:3000/auth/signin
```

- 설명 : 로그인 API 입니다.
- 역할 : 누구나 보낼 수 있는 api
- 토큰 필요 유무 : ❌
- 요청 Body 예시

```json
{
  "email": "bera@nexon.com",
  "password": "test123"
}
```

- 응답 예시:

```json
{
  "nickName": "베라GM",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJlcmFAbmV4b24uY29tIiwibmlja05hbWUiOiLrsqDrnbxHTSIsInJvbGVzIjpbIm9wZXJhdG9yIl0sImlhdCI6MTc0NzcwNzMyNiwiZXhwIjoxNzQ3NzA5MTI2fQ.d0a4X2-jZ5RInjhxDd2utDleUWjSU6euDHzyunQXgWqXqZMqiz9UMZkNURaMqRXp3RwNAMiizm17OiSjP3M1rIJy5NF2QSqhSssIqH3Brjcfk-hh34vCBt6oQc72dJAzZj63ZwcIUsXcFde2x1ZkM33DppF1wPynUyiI4S0m4yuDx6NXCPuBKABD4jT0Iu6dhk0Z7ZTvCrMHkOS1M4ZxoA6E7WMvZ4BmFrIWMooLq2GlYwNFCTou2zSMrKSdRJrl7dtV-MBqqF_ViqW21qg8sEoif2d9dPKP0PmrivYMy_thdxk7uTIs7ywHGJCvIE4UImCI5yMyi3S58SjarjPafA",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJlcmFAbmV4b24uY29tIiwibmlja05hbWUiOiLrsqDrnbxHTSIsInJvbGVzIjpbIm9wZXJhdG9yIl0sImlhdCI6MTc0NzcwNzMyNiwiZXhwIjoxNzQ4OTE2OTI2fQ.LAaHEkCInI_RHsFo9vbEjaIvNFInOsx6ULC8AnjMqR13EyYt-5r9oyHfQNL69pKuI5hvO-eQGusCnwtjtzZPEcS2IC0JTJR6ky6PU_yBViNqAmFWC8Rd8qsDOvbu7on0MihcWwRGl5sRQGHwMQcfXU_0JQ8IuVLXldx1hM0SS-8z7NXwNZubGSyc4RRBHwVXaQlcagpbPvO0k2KmVawp_fZNJLGoIqk51vc4DlTRjDXZImL7_VJDmxdf6IUPksFrlRiPmgQ8rsur1s7leAR8gfVuXCe2JkdBzOrQp7kuBzjQ_q89HQL0Get4sPPZkngsFUCTTQ9d39nSctpXPmSGJA"
}
```

**추가정보**

- 응답 받은 토큰으로 각 RBAC기능을 테스트 해보세요~!

### 💡3번💡 /auth/logout (POST)

```yaml
http://localhost:3000/auth/logout
```

- 설명 : 로그아웃 API입니다.
- 역할 : 누구나 보낼 수 있는 API
- 토큰 필요 유무 : ✅
- 요청 Body 예시 (해당 API는 Body에 데이터를 넣을 필요가 없습니다.)

```json

```

- 응답 예시:

```json
{
  "message": "로그아웃 되었습니다."
}
```

### 💡4번💡 /auth/refresh (POST)

```yaml
http://localhost:3000/auth/refresh
```

- 설명 : 리프레시 토큰으로 새로운 access 토큰을 재발급 받는 API입니다.
- 역할 : 누구나 보낼 수 있는 api
- 토큰 필요 유무 : ✅
- 요청 Body 예시 (해당 API는 Body에 데이터를 넣을 필요가 없습니다.)

```json

```

- 응답 예시:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJlcmFAbmV4b24uY29tIiwibmlja05hbWUiOiLrsqDrnbxHTSIsInJvbGVzIjpbIm9wZXJhdG9yIl0sImlhdCI6MTc0NzcwNzYxNCwiZXhwIjoxNzQ3Nzg1NTk5fQ.BSPJgAJ--DkBDtAgYsnpJpLV-CFGsYp5K-UlpxFc_-gtU3KZmwvRJNFezDmYJpiWCdPw-9EvIb_afMKcobnoXiPo3JnZ5Tfv2TG4Eq_k1PYBZumsjQ0mZprtqQknkWRDH6osH2siADHRnwopNE4dwCcM01MQd7tH-UT9FG7J0JVkBppsNR6MqjNq5td8-cd8mCZvfWb_dXFZX8B8sy449v1IYYMVdoa00ksOaaX5YOIGZ273zU4l4-Slej4A26yFJv-0SPZ2r6aOs5ilT1gGjkZKF1ft89JColOJ-i2DRz3UozYVDTLmdVmCr0UHZLIhdE97wXYMvSUWig5hI4iCnw"
}
```

### 💡5번💡 /event/lists (GET)

```yaml
http://localhost:3000/event/lists
```

- 설명 : 현재 만들어진 이벤트들을 모두 조회 할 수 있는 API입니다. (간략 정보만 옵니다)
- 역할 : 누구나 보낼 수 있는 api
- 토큰 필요 유무 : ❌
- 응답 예시:

```json
[
  {
    "_id": "682beca0b699f55404f0e1e6",
    "name": "3일 로그인 이벤트",
    "startAt": "2025-05-20T00:00:00.000Z",
    "periodInDays": 5,
    "isActive": true,
    "rewards": [
      {
        "itemId": "682be185b699f55404f0e1d4",
        "quantity": 10,
        "itemName": "자쿰의 투구"
      },
      {
        "itemId": "682be185b699f55404f0e1d6",
        "quantity": 5,
        "itemName": "덱 30가운"
      }
    ]
  }
]
```

**추가정보**

- 초기 데이터가 비어있을 겁니다. 먼저 8번 API /event/manager(POST) 이벤트 생성 API로 이벤트를 생성하시고 확인 가능합니다.
- 8번 API를 호출하시기 전에 7번 API /event/manager/option (GET) 으로 생성가능한 이벤트 조건 옵션정보를 받을 수 있습니다.
- 현재 응답 예시는 위 과정을 거치고 받는 응답을 넣었습니다.

### 💡6번💡 /event/list/:eventId (GET)

```yaml
http://localhost:3000/event/list/:eventId
```

- 설명 : 한 이벤트의 상세 정보를 볼 수 있는 API입니다.
- 역할 : 누구나 보낼 수 있는 api
- 토큰 필요 유무 : ❌
- 응답 예시:

```json
{
  "_id": "682bf169b699f55404f0e1ee",
  "name": "하루 로그인 이벤트",
  "description": "하루 로그인 하면 되는 이벤트",
  "startAt": "2025-05-20T00:00:00.000Z",
  "periodInDays": 5,
  "isActive": true,
  "rewards": [
    {
      "itemId": "682be185b699f55404f0e1d4",
      "quantity": 10,
      "itemName": "자쿰의 투구"
    },
    {
      "itemId": "682be185b699f55404f0e1d6",
      "quantity": 5,
      "itemName": "덱 30가운"
    }
  ]
}
```

**추가정보**

- 이벤트의 상세 정보를 볼 수 있는 API입니다.

### 💡7번💡 /event/manager/option (GET)

```yaml
http://localhost:3000/event/manager/option
```

- 설명 : 관리자가 이벤트를 생성 하기 전에, 현재 서버에서 만들 수 있는 이벤트 설정(옵션)정보를 받는 API입니다.
- 역할 : operator(베라GM, 유니온GM), admin(엘리시움GM)
- 토큰 필요 유무 : ✅
- 응답 예시:

```json
[
  {
    "type": "sign",
    "name": "로그인 이벤트 조건건",
    "description": "특정 로그인 조건을 만족한 사용자에게 지급하는 이벤트",
    "conditions": [
      {
        "key": "duration",
        "label": "총 로그인 누적 시간",
        "type": "number",
        "unit": "시간"
      },
      {
        "key": "days",
        "label": "누적 로그인 일수",
        "type": "number",
        "unit": "일"
      }
    ]
  }
]
```

**추가정보**

- 로그인 관련 이벤트를 생성할때 필요한 정보입니다. (sign)
- 총 로그인 누적시간을 조건으로 이벤트를 만듭니다. (key)
- 이벤트 기간 동안 총 접속 한 날짜 수를 조건으로 이벤트를 만듭니다. (days)

### 💡8번💡 /event/manager (POST)

```yaml
http://localhost:3000/event/manager
```

- 설명 : 관리자가 새로운 이벤트를 생성하는 API입니다.
- 역할 : operator(베라GM, 유니온GM), admin(엘리시움GM)
- 토큰 필요 유무 : ✅
- 요청 Body 예시 (주석 떼고 쓰세요!)

```json
{
  "name": "3일 로그인 이벤트", // 이벤트 제목입니다.
  "description": "5월 25일까지 총 3일이상 로그인 이벤트입니다.", // 이벤트 설명입니다.
  "startAt": "2025-05-20T00:00:00.000Z", // 이벤트 시작일 입니다.
  "periodInDays": 5, // 이벤트 총 기간 입니다.
  "isActive": true, // 이벤트 활성화 유무 입니다.
  "conditions": [
    {
      "type": "sign", // 로그인 타입 이벤트
      "key": "days", // 일 수로 이벤트 조건을 만듭니다. duration으로 해도 됩니다.
      "value": 3 // 총 3일 이라는 뜻 입니다. 단위는 일 입니다. key가 duration인 경우는 단위는 시간 입니다.
      // days로 테스트 하실때는 일 수 1일로 하셔서 테스트 해보세요!
      // duration으로 테스트 하실때는 value를 소숫점을 써보세요! 예시 : 0.0027 (10초)
      // duration은 로그인 로그아웃 기준으로 동작되니 위 1,2,3번 로그인 API를 한 유저기준으로 마구 넣어보세요
    }
  ],
  "rewards": [
    {
      "itemId": "682be185b699f55404f0e1d4", // 이벤트 조건 충족시 유저가 받는 아이템 아이디입니다.
      // 보상 아이템 아이디는 직접 입력하셔야 합니다!
      // ⭐http://localhost:3000/event/test/item(GET)요청으로 보내시면 아이템 정보를 받을 수 있습니다.⭐⭐⭐⭐⭐⭐⭐
      // 샘플 아이템을 세 개 넣어 뒀습니다. 원하시는 아이템의 _id값을 복사해서 여기 넣어주세요!
      "quantity": 10 // 이벤트 조건 충족시 이 아이템을 몇 개 받을 건지 수량입니다.
    },
    {
      "itemId": "682be185b699f55404f0e1d6", // rewards는 어레이 형태이므로 보상 아이템의 종류를 어레이 안 객체형식으로 여러개 지정할 수 있습니다.
      "quantity": 5
    }
  ]
}
```

- 응답 예시:

```json
{
  "message": "이벤트가 성공적으로 생성되었습니다.",
  "eventId": "682beca0b699f55404f0e1e6"
}
```

**추가정보**

- 관리자가 이벤트 생성 버튼을 누른다 (7번 API) → 서버에 등록할 수 있는 이벤트 옵션 정보를 받는다
- 정보를 갖고 원하는 이벤트를 생성한다. (8번 현재 API)
- 아이템 API는 DB에 저장 되어 있습니다. MSA구조상 kafka로 아이템 데이터를 보관하는 DB가 있다는 가정으로 제작했습니다.
- 너무 복잡해서 충족이 쉬운 BODY템플릿을 최하단에 넣어 놨습니다~

### 💡9번💡 /event/manager/toggle-active (POST)

```yaml
http://localhost:3000/event/manager/toggle-active
```

- 설명 : 특정 이벤트를 활성화 or 비활성화 하는 API입니다.
- 역할 : operator(베라GM, 유니온GM), admin(엘리시움GM)
- 토큰 필요 유무 : ✅
- 요청 Body 예시

```json
{
  "eventId": "682beca0b699f55404f0e1e6"
}
```

- 응답 예시:

```json
{
    "eventId": "682beca0b699f55404f0e1e6",
    "message": "이벤트가 비활성화되었습니다."
}
//or
{
    "eventId": "682beca0b699f55404f0e1e6",
    "message": "이벤트가 활성화되었습니다."
}
```

### 💡10번💡 /event/manager/requests (GET)

```yaml
http://localhost:3000/event/manager/requests
```

- 설명 : 관리자가 유저 보상 신청 정보를 받는 API입니다.
- 역할 : auditor(크로아GM), operator(베라GM, 유니온GM), admin(엘리시움GM)
- 토큰 필요 유무 : ✅
- 응답 예시:

```json
[
  {
    "_id": "682bf2c0b699f55404f0e1f9",
    "eventId": "682bf169b699f55404f0e1ee",
    "userId": "682bf1c197abedeace029d4d",
    "isSatisfied": true,
    "isReceived": true,
    "description": "여기 보상 받으세요~!",
    "createdAt": "2025-05-20T03:10:56.692Z"
  },
  {
    "_id": "682bf2d3b699f55404f0e1fa",
    "eventId": "682bf169b699f55404f0e1ee",
    "userId": "682bf1c197abedeace029d4d",
    "isSatisfied": true,
    "isReceived": false,
    "description": "이미 보상을 받은 이벤트트",
    "createdAt": "2025-05-20T03:11:15.537Z"
  },
  {
    "_id": "682bf2ecb699f55404f0e1fb",
    "eventId": "682beca0b699f55404f0e1e6",
    "userId": "682bf1c197abedeace029d4d",
    "isSatisfied": false,
    "isReceived": false,
    "description": "로그인 일수가 3일 이상이어야 합니다.",
    "createdAt": "2025-05-20T03:11:40.976Z"
  }
]
```

**추가정보**

- 유저가 요청을 보낸 기록들 입니다.
- 현재 응답 예시에는 한 유저만 테스트를 했는데 다른 유저로 요청하면 데이터가 더 잡힙니다.
- 필터링 기능은 없습니다.

### 💡11번💡 /event/user/request (POST)

```yaml
http://localhost:3000/event/user/request
```

- 설명 : 유저가 특정 이벤트에 대해서 보상을 요청하는 API입니다.
- 역할 : user (회원가입 API 호출하셔서 토큰 갖고 쓰세요!)
- 토큰 필요 유무 : ✅
- 요청 Body 예시

```json
{
  "eventId": "682bf169b699f55404f0e1ee"
}
```

- 응답 예시:

```json
{
    "message": "이벤트 조건이 충족되었습니다. 아이템을 획득하셨습니다.",
    "rewards": [
        {
            "itemId": "682be185b699f55404f0e1d4",
            "quantity": 10
        },
        {
            "itemId": "682be185b699f55404f0e1d6",
            "quantity": 5
        }
    ],
    "description": "여기 보상 받으세요~!"
}

//or

{
    "message": "이미 보상을 받으셨는데요?",
    "description": "욕심이 많으시군요?"
}

//or

{
    "message": "이벤트 조건이 충족되지 않았습니다.",
    "description": "로그인 일수가 3일 이상이어야 합니다."
}
```

**추가정보**

- 8번 API로 여러 이벤트를 생성하셔서 1,2,3번 로그인아웃 API로 한 유저로 테스트 해보세요!
- 그러면 저렇게 조건에 따라 응답이 다르게 옵니다.

### 💡12번💡 /event/user/request/me (GET)

```yaml
http://localhost:3000/event/user/request/me
```

- 설명 : 유저가 본인의 요청 기록을 볼 수 있는 API입니다.
- 역할 : user (회원가입 API 호출하셔서 토큰 받아 쓰세요!)
- 토큰 필요 유무 : ✅
- 응답 예시:

```json
{
  "userId": "682bf1c197abedeace029d4d",
  "total": 3,
  "requests": [
    {
      "_id": "682bf2ecb699f55404f0e1fb",
      "eventId": "682beca0b699f55404f0e1e6",
      "userId": "682bf1c197abedeace029d4d",
      "isSatisfied": false,
      "isReceived": false,
      "description": "로그인 일수가 3일 이상이어야 합니다.",
      "createdAt": "2025-05-20T03:11:40.976Z"
    },
    {
      "_id": "682bf2d3b699f55404f0e1fa",
      "eventId": "682bf169b699f55404f0e1ee",
      "userId": "682bf1c197abedeace029d4d",
      "isSatisfied": true,
      "isReceived": false,
      "description": "이미 보상을 받은 이벤트트",
      "createdAt": "2025-05-20T03:11:15.537Z"
    },
    {
      "_id": "682bf2c0b699f55404f0e1f9",
      "eventId": "682bf169b699f55404f0e1ee",
      "userId": "682bf1c197abedeace029d4d",
      "isSatisfied": true,
      "isReceived": true,
      "description": "여기 보상 받으세요~!",
      "createdAt": "2025-05-20T03:10:56.692Z"
    }
  ]
}
```

**추가정보**

- 먼저 11번 API를 적절히 호출 하셔야 DB에 요청 기록이 쌓입니다!
- 현재 응답 예시는 위 과정을 거치고 받는 응답을 넣었습니다.

---

# 추가 자료

8번 이벤트 생성 API BODY 샘플 템플릿.

```yaml
// 10초동안 로그인이 되면 보상을 줍니다!
{
  "name": "10초 로그인이벤트",
  "description": "10초 이상 로그인 유지하면 되는 이벤트",
  "startAt": "2025-05-20T00:00:00.000Z", // 여기 최근 날짜로 바꿔 주세요~
  "periodInDays": 5,
  "isActive": true,
  "conditions": [
    {
      "type": "sign",
      "key": "duration",
      "value": 0.0027
    }
  ],
  "rewards": [
    {
      "itemId": "직접 넣어주세요",
      "quantity": 10
    },
    {
      "itemId": "직접 넣어주세요",
      "quantity": 5
    }
  ]
}
```

```yaml
// 하루 로그인 조건 이벤트 입니다! 로그인만 하면 바로 줍니다!
{
  "name": "하루 로그인 이벤트",
  "description": "하루 로그인 하면 되는 이벤트",
  "startAt": "2025-05-20T00:00:00.000Z", // 여기 최근 날짜로 바꿔 주세요~
  "periodInDays": 5,
  "isActive": true,
  "conditions": [
    {
      "type": "sign",
      "key": "days",
      "value": 1
    }
  ],
  "rewards": [
    {
      "itemId": "직접 넣어주세요",
      "quantity": 10
    },
    {
      "itemId": "직접 넣어주세요",
      "quantity": 5
    }
  ]
}

{
    "message": "이벤트가 성공적으로 생성되었습니다.",
    "eventId": "682bf169b699f55404f0e1ee"
}
```
