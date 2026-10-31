---
theme: default
title: 템플릿 쇼케이스 (Template Showcase)
info: 슬라이드 템플릿 카탈로그 및 통폐합 가이드
class: cover
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

# 템플릿 쇼케이스<br><small style="font-size: 36px; color: #a5c7f8; font-weight: normal;">Template Showcase</small>

<p class="author">홍길동 / 소속</p>

<p class="event">Time Machine Conference 1955-11-12</p>

---
class: speaker
---

<div class="speaker-sidebar">
  <h2>발표자</h2>
</div>

<div class="speaker-main">
  <img src="./images/profile.png" alt="프로필" class="speaker-avatar" />
  <div class="speaker-title">홍길동/ 소속 / Cloud Engineer</div>
  <div class="speaker-bio">
    Time Machine을 개발하는 업무를 하고 있습니다.<br>
    시간과 공간 테스트 관련 주제에 관심이 많습니다.
  </div>
  <div class="speaker-link">
    발표자료 <a href="https://github.com/jmnote/slides" target="_blank" rel="noopener">https://github.com/jmnote/slides</a>
  </div>
  <div class="speaker-github">
    <svg viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
    <a href="https://github.com/jmnote" target="_blank" rel="noopener">jmnote</a>
  </div>
</div>

---
class: toc
---

<div class="toc-sidebar">
  <h2>목차</h2>
</div>

<div class="toc-main">
  <div class="toc-list">
    <div class="toc-item">
      <span class="toc-num">Ⅰ.</span>
      <span class="toc-text">배경 및 실감</span>
    </div>
    <div class="toc-item">
      <span class="toc-num">Ⅱ.</span>
      <span class="toc-text">분류 체계</span>
    </div>
    <div class="toc-item">
      <span class="toc-num">Ⅲ.</span>
      <span class="toc-text">관심 프로젝트 비교</span>
    </div>
    <div class="toc-item">
      <span class="toc-num">Ⅳ.</span>
      <span class="toc-text">도입 시 고려사항 및 결론</span>
    </div>
  </div>
</div>

---
class: section
---

<div class="section-content">
  <span class="section-badge">Ⅰ</span>
  <span class="section-title">섹션 <small class="pen">T4: Divider</small></span>
</div>

---

<header class="slide-header">
  <h1>T5. 기본 본문형 <small>Header + Bullets</small></h1>
  <span class="header-badge">추천: 60% 비중</span>
</header>

<div class="meta-tag">용도: 일반적인 설명, 개념 요약, 목록 나열</div>

### 핵심 메시지나 서브 타이틀

- **마크다운 본연의 간결함**: HTML 태그를 쓰지 않고 순수 불릿으로 작성
- **22px 이상 가독성 확보**: 슬라이드 전역에서 22px 크기를 유지하여 발표장 맨 뒤에서도 선명
- **손글씨 포인트 메모**: 발표자의 감상이나 부가설명은 `<span class="pen">`으로 강조
- **코드 인라인 표기**: `kubectl get pods` 또는 `go test ./...`
- 복잡한 그리드 없이 상단 헤더와 자연스러운 줄바꿈만으로 깔끔하게 표현

<p class="pen" style="margin-top: 36px; text-align: right;">
  ※ 가장 단순하면서도 슬라이드 덱의 50~60%를 커버할 수 있는 만능 기본형!
</p>

---

<header class="slide-header">
  <h1>T6. 2열 분할형 <small>Left Text + Right Visual</small></h1>
  <span class="header-badge">추천: 30% 비중</span>
</header>

<div class="meta-tag">용도: 텍스트 설명 + 스크린샷 / 밈 / 아키텍처 / 비교 대조</div>

<div class="two-cols">
<div>

### 텍스트 영역 (왼쪽)

- **상황 설명**: 핵심 포인트 2~4개
- 복잡한 설치 과정이나 인터페이스 설명
- 우측 이미지와 1:1로 대응되는 명확한 문장 구성
- 불릿 사이에 자연스러운 여백 유지

</div>
<div>

<img src="./images/life-of-an-engineer.png" alt="엔지니어의 삶" style="max-height: 240px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />

<div class="pen" style="font-size: 24px; text-align: right; margin-top: 16px; line-height: 1.5;">
  우측에는 캡처 이미지나 다이어그램을 배치하고,<br>
  하단에 손글씨 코멘트를 덧붙이는 구조!
</div>

</div>
</div>

---

<header class="slide-header">
  <h1>T7. 3열 카드형 <small>3 Cards Grid</small></h1>
  <span class="header-badge">특수 비교형</span>
</header>

<div class="meta-tag">용도: 3개 지표(AI Gauge), 3개 제품 비교, 3단계 파이프라인</div>

<div class="cards-3">
  <div class="card">
    <h3>1단계: 질문/탐색</h3>
    <p>단순 질의응답 및 코드 검색 단계</p>
    <div style="background: #eef2f8; padding: 12px; border-radius: 4px; font-size: 18px; text-align: center;">
      📊 탐색 수준: 30%
    </div>
    <span class="pen" style="margin-top: 12px; text-align: center;">ChatGPT 수준</span>
  </div>
  <div class="card">
    <h3>2단계: 코드 생성</h3>
    <p>함수 단위 코드 생성 및 테스트 자동화</p>
    <div style="background: #eef2f8; padding: 12px; border-radius: 4px; font-size: 18px; text-align: center;">
      📊 완성 수준: 70%
    </div>
    <span class="pen" style="margin-top: 12px; text-align: center;">GitHub Copilot</span>
  </div>
  <div class="card">
    <h3>3단계: 자율 실행</h3>
    <p>도구 실행, 배포, 장애 복구 자율화</p>
    <div style="background: #eef2f8; padding: 12px; border-radius: 4px; font-size: 18px; text-align: center;">
      📊 에이전트: 90%+
    </div>
    <span class="pen" style="margin-top: 12px; text-align: center;">AI Agent 시대</span>
  </div>
</div>

<p class="pen" style="margin-top: 24px; text-align: center;">
  🤔 <strong>통폐합 검토</strong>: 3열 카드가 꼭 필요할까요? 아니면 2열 분할 또는 표(Table)로 흡수 가능할까요?
</p>

---

<header class="slide-header">
  <h1>T8. 표 비교형 <small>Comparison Table</small></h1>
  <span class="header-badge">정리/매트릭스형</span>
</header>

<div class="meta-tag">용도: 기능 비교, 도구 목록, 환경 분석 (Agent 사용환경 등)</div>

<div class="table-lg">

| 구분 | 일반 도구 (CLI / Script) | AI Agent 기반 도구 |
| :---: | :---: | :---: |
| **명령 실행** | 정해진 옵션과 파라미터만 허용 | 자연어 의도 해석 후 명령 자동 조합 |
| **예외 처리** | 에러 발생 시 즉시 중단 | 에러 로그를 분석하여 자체 재시도/우회 |
| **컨텍스트** | 단발성 세션 실행 | 이전 실행 맥락 및 저장소 규칙 기억 |

</div>

<p class="pen" style="margin-top: 18px; text-align: right;">
  ※ 표는 순수 마크다운 `|` 문법으로 작성되며, 헤더/줄간격/폰트(22px)는 CSS가 자동 제어
</p>

---

<header class="slide-header">
  <h1>📐 템플릿 통폐합 분석 매트릭스</h1>
  <span class="header-badge">의사결정용</span>
</header>

### 8개 템플릿 → 4개 핵심 축으로 압축 가능 여부

| 템플릿 구분 | 현재 후보군 | 통폐합 제안 | 이유 및 기대효과 |
| :---: | :---: | :---: | :--- |
| **필수 특수형** | T1(Cover), T2(Speaker), T3(TOC), T4(Divider) | **현행 유지** | 각 슬라이드덱당 정확히 1회씩만 나오는 필수 프레임 |
| **본문 기본** | T5(기본 본문형) | **기본형 (유지)** | 마크다운 본연의 생산성, 가장 많은 슬라이드 소화 |
| **2단 분할** | T6(2열 텍스트+이미지), T6-b(텍스트 대조) | **2단형 (유지)** | `<div class="two-cols">` 하나로 설명+그림 모두 해결 |
| **3단 카드** | T7(3열 카드 박스) | **👉 T8(표) or T6(2단)으로 통합 권장** | CSS 코드가 늘어나고 모바일/반응형에서 깨지기 쉬움 |
| **표 비교** | T8(표 비교형) | **표형 (유지)** | 마크다운 표 문법 자체를 22px로 스타일링해 재활용 |

<div class="pen" style="font-size: 26px; text-align: center; margin-top: 20px;">
  👉 결론: 본문은 사실상 <b>기본형(T5), 2열형(T6), 표형(T8) 3가지</b>만 있으면 37장 전체를 완성 가능!
</div>
