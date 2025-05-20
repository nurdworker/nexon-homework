# Nexon Homework 프로젝트 (Nurd Worker)

## 일반 API 명세

---

## ⚠️ 포트 충돌 관련 안내

`api-gw` 서비스는 기본적으로 **포트 3000**을 사용합니다.

만약 이미 로컬에서 3000번 포트를 사용하는 프로세스가 있다면,  
`docker-compose.yml` 파일에서 `api-gw`의 포트 포워딩 설정을 변경해 주세요.

포트를 변경하셨다면, 이 명세서 내 API 호출 예시에서도  
반드시 변경한 포트 번호를 반영하여 테스트하시기 바랍니다.

---

### Auth Service API (인증관련 서비스)

### 회원가입 API (POST)

<div style="background-color:#e6f7ff; color:#003a8c; padding:15px 20px; border-radius:8px; border: 1px solid #91d5ff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px;">
  <p style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">http://localhost:3000/auth/signin</p>
  <p style="font-size: 14px; margin-bottom: 12px;">회원가입 API 요청입니다.</p>
  <div style="display: inline-block; background-color: #bae7ff; color: #0050b3; font-weight: 600; padding: 4px 10px; border-radius: 20px; font-size: 12px; user-select: none;">
    role : public <span style="font-weight: normal; margin-left: 8px; color: #096dd9;">(토큰 필요 없는 API 요청)</span>
  </div>
</div>

<details markdown="1">
<summary>상세 내용 보기</summary>

운영 관련 설명

#### 파라미터

##### 경로 변수 (Path)

| 이름 | 타입 |           설명           |   필수 여부    |
| :--: | :--: | :----------------------: | :------------: |
|  id  | 타입 | 파라미터 설명 (선택사항) | 필수 또는 선택 |

##### 헤더 (Headers)

| 이름 | 타입 |           설명           |   필수 여부    |
| :--: | :--: | :----------------------: | :------------: |
|  id  | 타입 | 파라미터 설명 (선택사항) | 필수 또는 선택 |

##### 쿠키 (Cookies)

| 이름 | 타입 |           설명           |   필수 여부    |
| :--: | :--: | :----------------------: | :------------: |
|  id  | 타입 | 파라미터 설명 (선택사항) | 필수 또는 선택 |

##### 요청 본문 (Body)

| 이름 | 타입 |           설명           |   필수 여부    |
| :--: | :--: | :----------------------: | :------------: |
|  id  | 타입 | 파라미터 설명 (선택사항) | 필수 또는 선택 |

#### 응답

  <details markdown="1">
  <summary>200 OK : 설명</summary>

```json
{
  // 응답 내용
}
```
