---
theme: default
title: 템플릿 쇼케이스
info: 슬라이드 템플릿 카탈로그
class: cover
showClassName: true
browserExporter: true
colorSchema: light
aspectRatio: 16/9
canvasWidth: 1280
fonts:
  sans: Noto Sans KR
  provider: none
drawings:
  enabled: false
transition: none
mdc: false
---

# 템플릿 쇼케이스
## Template Showcase
- 김정민 / 삼성SDS
- Time Machine Conference

---
class: speaker
---

# 발표자
## 김정민 / 삼성SDS / Cloud Engineer
- Time Machine을 개발하는 업무를 하고 있습니다.
- 시간과 공간 테스트 관련 주제에 관심이 많습니다.
- :github: jmnote

---
class: staircase
---

# 지난 발표

- ![](./images/history-1.png) **24.09** Cloud Native Korea Community Day 2024
- ![](./images/history-2.png) **25.05** KCD Seoul 2025
- ![](./images/history-3.png) **25.10** Cloud Native Korea Community Day 2025

> **26.10**
> _그동안 개발 주제_
> _AI 관련은 처음_

---
class: toc
---

# 목차
## 배경
## 분류 체계
## 관심 프로젝트 비교
## 마무리

---
class: section
---

# 섹션 <small>section</small>

---

# 기본형 <small>목록 예시</small>

> 슬라이드 대부분은 제목과 목록만으로 충분합니다
>
> 핵심 메시지를 3~5개 항목으로 정리해 보여 줍니다

- **마크다운 본연의 간결함**: HTML 태그를 쓰지 않고 순수 불릿으로 작성
- **22px 이상 가독성 확보**: 슬라이드 전역에서 22px 크기를 유지하여 발표장 맨 뒤에서도 선명
- **손글씨 포인트 메모**: 발표자의 감상이나 부가설명은 `_…_`로 강조
- **코드 인라인 표기**: `kubectl get pods` 또는 `go test ./...`
- 복잡한 그리드 없이 상단 헤더와 자연스러운 줄바꿈만으로 깔끔하게 표현

> _복잡한 배치 없이도 읽기 쉬운 화면이 됩니다_
>
> _덱의 절반 이상을 이 형식으로 만들 수 있습니다_

---
class: points
---

# 번호 포인트 <small>class: points</small>

> 항목마다 꼬리표 한 줄과 설명 한 줄로 나눕니다
>
> 꼬리표만 훑어도 흐름이 보입니다

1. **마크다운 본연의 간결함**
   HTML 태그 없이 번호 목록과 굵은 글씨만으로 작성
2. **22px 이상 가독성**
   발표장 맨 뒤에서도 선명하게 읽히는 크기
3. **손글씨 포인트 메모**
   발표자의 감상이나 부가설명은 `_…_`로 강조
4. **번호는 자동**
   `1.`만 쓰면 01, 02…로 매겨짐

> _순서나 단계가 있는 3~5개 항목에 알맞습니다_

---

# 기본형 <small>표 예시</small>

> 같은 기준으로 여러 대상을 비교할 때는 표가 가장 명확합니다
>
> 행은 비교 기준, 열은 비교 대상으로 둡니다

| 구분 | 일반 도구 (CLI / Script) | AI Agent 기반 도구 |
| :---: | :---: | :---: |
| **명령 실행** | 정해진 옵션과 파라미터만 허용 | 자연어 의도 해석 후 명령 자동 조합 |
| **예외 처리** | 에러 발생 시 즉시 중단 | 에러 로그를 분석하여 자체 재시도/우회 |
| **컨텍스트** | 단발성 세션 실행 | 이전 실행 맥락 및 저장소 규칙 기억 |

> _AI Agent 기반 도구는 실행·예외 처리·맥락 유지 모두에서 유연합니다_
>
> _대신 맡길 권한과 검증 범위를 분명히 정해야 합니다_

---
class: table-full
---

# 긴 표 _12행_

| # | 리소스 | 분류 | 역할 |
|:---:|:---:|:---:|---|
| 1 | **Pod** | 워크로드 | 컨테이너를 실행하는 최소 단위 |
| 2 | **Deployment** | 워크로드 | 무상태 앱의 배포와 롤링 업데이트 |
| 3 | **StatefulSet** | 워크로드 | 고유 ID와 저장소가 필요한 상태 앱 |
| 4 | **DaemonSet** | 워크로드 | 노드마다 하나씩 실행 (로그·모니터링) |
| 5 | **Job** | 워크로드 | 한 번 실행하고 끝나는 작업 |
| 6 | **CronJob** | 워크로드 | 일정에 따라 반복 실행 |
| 7 | **Service** | 네트워크 | Pod 묶음에 고정 주소 제공 |
| 8 | **Ingress** | 네트워크 | 외부 HTTP 요청을 서비스로 라우팅 |
| 9 | **ConfigMap** | 설정 | 설정값을 이미지와 분리 |
| 10 | **Secret** | 설정 | 비밀번호·토큰 같은 민감 정보 |
| 11 | **PersistentVolume** | 저장소 | 클러스터 수준의 저장 공간 |
| 12 | **Namespace** | 격리 | 리소스를 논리적으로 나누는 단위 |

---
class: sidebar table-full table-dense
---

# 더 긴 표 _16행_

| # | 리소스 | 분류 | 역할 |
|:---:|:---:|:---:|---|
| 1 | **Pod** | 워크로드 | 컨테이너를 실행하는 최소 단위 |
| 2 | **ReplicaSet** | 워크로드 | 같은 Pod를 정해진 개수만큼 유지 |
| 3 | **Deployment** | 워크로드 | 무상태 앱의 배포와 롤링 업데이트 |
| 4 | **StatefulSet** | 워크로드 | 고유 ID와 저장소가 필요한 상태 앱 |
| 5 | **DaemonSet** | 워크로드 | 노드마다 하나씩 실행 (로그·모니터링) |
| 6 | **Job** | 워크로드 | 한 번 실행하고 끝나는 작업 |
| 7 | **CronJob** | 워크로드 | 일정에 따라 반복 실행 |
| 8 | **HorizontalPodAutoscaler** | 워크로드 | 부하에 따라 Pod 수 자동 조절 |
| 9 | **Service** | 네트워크 | Pod 묶음에 고정 주소 제공 |
| 10 | **Ingress** | 네트워크 | 외부 HTTP 요청을 서비스로 라우팅 |
| 11 | **NetworkPolicy** | 네트워크 | Pod 사이 통신 허용 규칙 |
| 12 | **ConfigMap** | 설정 | 설정값을 이미지와 분리 |
| 13 | **Secret** | 설정 | 비밀번호·토큰 같은 민감 정보 |
| 14 | **PersistentVolume** | 저장소 | 클러스터 수준의 저장 공간 |
| 15 | **PersistentVolumeClaim** | 저장소 | Pod가 저장 공간을 요청하는 방법 |
| 16 | **Namespace** | 격리 | 리소스를 논리적으로 나누는 단위 |

---
class: hero
---

# 2026년 _AI 시대 실감_

- ## 작년과는 다르다
  - 코드를 직접 보는 일 대폭 감소
  - Markdown 문서 중심 _가끔 테스트 코드_
  - 코딩테스트 폐지 추세 _AI활용평가 대체_
- ![Life of an Engineer](./images/life-of-an-engineer.png)
  _Claude Community<br>FB '26.09_
- ## Agent가 잘하는 것
  - 코드/문서 작성, 설계, 로그 분석, 문의 대응, 신기술 탐색…
  - go, gh, kubectl, openstack cli… _그냥 다 잘함_
  - _아직 못하는 것? 내 마음에 드는 PPT 작성 ㅎ_
- ## 그리고...
  - 수학·물리학 난제 해결, 취약점 발견
  - AI 블루 <small>Claude Blue</small>
  - _약간의 허탈감과 위기의식?_

---
class: cards
---

# 카드형 <small>class: cards</small>

> AI 코딩 도구는 크게 세 단계를 거쳐 발전하고 있습니다
>
> 단계가 올라갈수록 사람의 역할은 작성에서 검토로 옮겨 갑니다

- ## 1단계: 질문/탐색
  단순 질의응답 및 코드 검색 단계

  **📊 탐색 수준: 30%**

  _ChatGPT 수준_
- ## 2단계: 코드 생성
  함수 단위 코드 생성 및 테스트 자동화

  **📊 완성 수준: 70%**

  _GitHub Copilot_
- ## 3단계: 자율 실행
  도구 실행, 배포, 장애 복구 자율화

  **📊 에이전트: 90%+**

  _AI Agent 시대_

> _지금 대부분의 팀은 2단계와 3단계 사이에 있습니다_
>
> _다음 과제는 반복 작업을 에이전트에게 맡기는 기준 정하기_

---
class: cols
---

# 다단형 <small>class: cols</small>

> 최상위 목록 항목 하나가 한 칸이 됩니다

- ### 출발점 (Why)

  - **쏟아지는 AI 기술**: 전체 생태계의 큰 그림 파악
  - **엔지니어의 시선**: 생태계 분류와 프로젝트 비교
  - **선택과 집중**: 상세 분석보다 맥락 중심
- ### 접근법 (How)

  - **01 개념 정리**<br>
    기본 개념과 Landscape 탐색
  - **02 분류 체계**<br>
    실행 위치 · 목적 · 기술 계층
  - **03 프로젝트 비교**<br>
    주요 프로젝트 4종 비교

---
class: cols
---

# 다단형 <small>글 + 그림</small>

- ### 그림이 있는 칸

  - 마지막 칸이 그림뿐이면 글 3 : 그림 2 비율
  - 그림은 칸 폭에 맞춰 줄어듦
  - _출처는 그림 아래 손글씨로_
- ![Life of an Engineer](./images/life-of-an-engineer.png)

---
class: visual
---

# 그림 한 장 <small>class: visual</small>

![Life of an Engineer](./images/life-of-an-engineer.png)

---
class: sidebar table-full
---

# 클래스 목록

| class | 용도 | 견본 |
|:---:|---|:---:|
| `cover` | 표지 | [1](/1) |
| `speaker` | 발표자 소개 | [2](/2) |
| `staircase` | 계단식 카드 (지난 발표 등) | [3](/3) |
| `toc` | 목차 | [4](/4) |
| `section` | 섹션 구분 (번호 자동) | [5](/5) |
| (없음) | 기본형 (목록·표) | [6](/6), [8](/8) |
| `points` | 번호 포인트 (꼬리표 + 설명, 4개 이상 2열) | [7](/7) |
| `table-full` | 표가 남은 높이를 채움 | [9](/9), [10](/10), [16](/16) |
| `table-dense` | 촘촘한 표 (글자·여백 축소) | [10](/10) |
| `sidebar` | 세로 제목 (단독 또는 다른 클래스와 조합) | [10](/10), [16](/16) |
| `hero` | 큰 그림 중심 | [11](/11) |
| `cards` | 카드 n열 | [12](/12) |
| `cols` | n열 (목록 항목 = 칸, 글+그림 자동 비율) | [13](/13), [14](/14) |
| `visual` | 그림 한 장 (남은 높이에 맞춤) | [15](/15) |
