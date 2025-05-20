# event쪽 api 명세서 작성하기

book mark: No
creation time: 2025년 5월 19일 오전 8:34
process: on processing

<aside>
💡

**perpose**

</aside>

---

# API 명세서

<aside>
💡

**공통사항**

기본경로 : [http://localhost:3000](http://localhost:3000/event/manager/requests/export) (docker compose 파일 api-gw서비스 포트, 필요시 수정 하셔서 사용하세요~)
기본 토큰 헤더 설정 : Authorization / Bearer
기본 POST요청 : Body raw JSON형식

</aside>

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

| **Idx** | **경로**              | **HTTP 메서드** | **설명**                                                                           | **role (RBAC)** | **토큰 필요?** | **서비스** |
| ------- | --------------------- | --------------- | ---------------------------------------------------------------------------------- | --------------- | -------------- | ---------- |
| 1       | /auth/signin          | POST            | 로그인 API                                                                         | public          |                | auth       |
| 2       | /auth/signup          | POST            | 회원 가입 API                                                                      | public          |                | auth       |
| 3       | /auth/logout          | POST            | 로그아웃 API                                                                       | public          | ✅             | auth       |
| 4       | /auth/refresh         | POST            | 토큰 갱신 API                                                                      | public          | ✅             | auth       |
|         |                       |                 |                                                                                    |                 |                |            |
| 5       | /event/lists          | GET             | 이벤트 목록 보기 API                                                               | public          |                | event      |
| 6       | /event/list/:eventId  | GET             | 특정 이벤트 상세 보기 API                                                          | public          |                | event      |
| 7       | /event/manager/option | GET             | 이벤트 조건 옵션 조회. 이벤트 생성 전에 생성할 수 있는 이벤트 정보 받는 API입니다. | operator, admin | ✅             | event      |
| 8       |                       |                 |                                                                                    |                 |                | event      |
| 9       |                       |                 |                                                                                    |                 |                | event      |
| 10      |                       |                 |                                                                                    |                 |                | event      |
| 11      |                       |                 |                                                                                    |                 |                | event      |
| 12      |                       |                 |                                                                                    |                 |                | event      |
| 13      |                       |                 |                                                                                    |                 |                | event      |

| 경로                           | HTTP 메서드 | 역할                                      | 설명                                                     | role            |     |
| ------------------------------ | ----------- | ----------------------------------------- | -------------------------------------------------------- | --------------- | --- |
| /event/manager/option          | GET         | 이벤트 생성 옵션 조회                     | 관리자용, 이벤트 생성 시 선택할 수 있는 옵션 정보 조회   | operator, admin |     |
| /event/manager                 | POST        | 이벤트 생성                               | 관리자용, 새로운 이벤트 생성                             | operator, admin |     |
| /event/manager/requests        | GET         | 관리자 - 유저 보상요청 기록 조회          | 관리자용, 유저들의 보상 요청 목록 조회                   | auditor, admin  |     |
| /event/manager/requests/export | GET         | 관리자 - 유저 보상요청 기록 엑셀 다운로드 | 관리자용, 유저들의 보상 요청 목록을 엑셀 파일로 다운로드 | auditor, admin  |     |
| /event                         | GET         | 전체 이벤트 목록 조회                     | 모든 사용자(로그인/비로그인) 대상, 이벤트 리스트 조회    |                 |     |
| /event/:eventId                | GET         | 특정 이벤트 상세 조회                     | 모든 사용자 대상, 특정 이벤트 상세 내용 조회             |                 |     |
| /event/user/requests/me        | GET         | 로그인한 사용자 - 본인 보상요청 기록 조회 | 로그인 사용자 대상, 본인의 보상 요청 목록 조회           | user            |     |
| /event/user/request/:eventId   | POST        | 로그인한 사용자 - 특정 이벤트 보상 요청   | 로그인 사용자 대상, 특정 이벤트에 대한 보상 요청 제출    | user            |     |

## manager

- /event/manager/option (GET)
  ### 1. 이벤트 옵션 조회
  **GET** `/event/manager/option`
  - 설명: 생성 가능한 이벤트 타입 및 조건을 조회
  - 응답 예시:
  ```json
  [
    {
      "type": "sign",
      "name": "로그인 누적 이벤트",
      "description": "특정 조건을 만족한 로그인 사용자에게 지급하는 이벤트",
      "conditions": [
        {
          "key": "days",
          "label": "누적 로그인 일수",
          "type": "number",
          "unit": "일"
        },
        {
          "key": "duration",
          "label": "총 로그인 유지 시간",
          "type": "number",
          "unit": "시간"
        }
      ]
    }
  ]
  ```
- /event/manager (POST)

  ### 2. 이벤트 생성

  **POST** `/event/manager`

  - 설명: 새로운 이벤트를 생성
  - 요청 Body:

  ```json
  {
    "name": "3일간 로그인 이벤트",
    "description": "5월 25일까지 총 3일이상 로그인 유지 이벤트입니다.",
    "startAt": "2025-05-20T00:00:00.000Z",
    "periodInDays": 5,
    "isActive": true,
    "conditions": [
      {
        "type": "sign",
        "key": "days",
        "value": 3
      }
    ],
    "rewards": [
      {
        "itemId": "682aae1c7334c086e8d705d2",
        "quantity": 10
      },
      {
        "itemId": "682aae1c7334c086e8d705d3",
        "quantity": 5
      }
    ]
  }
  ```

  ```json
  {
    "name": "2일간 로그인 이벤트",
    "description": "5월 25일까지 총 2일이상 로그인 유지 이벤트입니다.",
    "startAt": "2025-05-20T00:00:00.000Z",
    "periodInDays": 5,
    "isActive": true,
    "conditions": [
      {
        "type": "sign",
        "key": "days",
        "value": 2
      }
    ],
    "rewards": [
      {
        "itemId": "682aae1c7334c086e8d705d2",
        "quantity": 10
      },
      {
        "itemId": "682aae1c7334c086e8d705d3",
        "quantity": 5
      }
    ]
  }
  ```

  - 응답:

  ```json
  {
    "message": "이벤트가 성공적으로 생성되었습니다.",
    "eventId": "664a123efb13eab12ce192aa"
  }
  ```

- /event/manager/:eventId/requests/export

<aside>
🔥

**trouble shooting**

</aside>

---

<aside>
👌

**conclusion**

</aside>
