# 발표 자료 관리 도구

발표 추가, 로컬 미리보기, 사이트 빌드와 배포를 위한 관리 문서입니다.
이 문서의 파일 경로와 실행 명령은 저장소 루트 기준입니다.
`make docs`는 루트 `README.md`의 발표 목록만 갱신합니다.

## 로컬 실행

Node.js 22.12 이상, pnpm 12.16.1, make를 사용합니다. CI는 Node.js 24를 사용합니다.
`tooling/package.json`의 `packageManager`에 pnpm 버전을 고정했습니다.
패키지 설정과 공통 의존성은 `tooling/`에서 관리하며, 아래 명령은 저장소 루트에서 실행합니다.

```sh
make                                    # 사용법
make install                            # 의존성 설치
make dev                                # 가장 최근 Slidev 발표
make dev TALK=k8s-ai-agent               # ID로 발표 선택
make build                              # 목록 + 모든 Slidev 발표 + 기존 PDF
make preview                            # 빌드 결과 확인
make docs                               # README 발표 목록 갱신
make check                              # 테스트·README 동기화·전체 빌드 검증
```

Makefile은 `pnpm --dir tooling …` 명령을 호출합니다. 패키지 스크립트를 직접 실행해도 됩니다.

목록: http://localhost:4173/slides/

발표: http://localhost:4173/slides/k8s-ai-agent/

장표 주소는 `#/장표번호` 형식으로, GitHub Pages에서도 직접 열거나 새로고침할 수 있습니다.
서버는 명령 실행 중에만 동작하며 Ctrl+C로 종료합니다.

## 발표 추가

1. Slidev 발표는 `연도/날짜-id/slides.md`와 같은 폴더의 `images/`에 작성합니다.
   PDF는 `연도/YYYY-MM-DD-id.pdf` 형식으로 이름을 짓습니다.
2. `tooling/site/talks.yaml`에 항목을 추가합니다. `id`, `date`, `title`, `event`는 필수이고,
   `slides`는 선택 사항입니다. `id`는 영문 소문자·숫자·하이픈으로 작성하고 전체 발표에서 고유해야 합니다.
   공개 URL은 `/slides/<id>/`이므로 공개 후에는 ID를 유지합니다.
   PDF는 모든 발표에 필수이며 `연도/날짜-id.pdf` 경로로 자동 계산하므로 `pdf` 필드는 작성하지 않습니다.
   Slidev가 있으면 `slides: true`를 지정합니다. `연도/날짜-id/slides.md`가 없으면 검증에 실패합니다.
   `slides`를 생략하거나 `false`로 지정하면 PDF만 제공합니다.
3. `make docs`로 README 목록을 갱신합니다.
4. `make check`로 메타데이터 검사, README 동기화, 전체 빌드를 확인합니다.

```yaml
- id: example-talk
  date: '2026-11-15'
  title: 새 발표 제목
  event: 행사명
  slides: true
```

`tooling/site/talks.yaml`에 등록한 발표만 배포합니다. 파일 누락이나 ID·발표 경로 중복은 빌드 전에 오류로 처리합니다.
목록 페이지와 README는 같은 메타데이터를 사용합니다. 발표 파일 경로는 저장소 루트 기준입니다.
운영 스크립트는 `tooling/scripts/`, 목록 페이지 스타일은 `tooling/site/`에서 관리합니다.
공통 빌드는 `dist/`를 매번 새로 생성하며, 빌드 산출물은 커밋하지 않습니다.
PDF는 날짜와 id로 계산한 경로로 복사합니다. 새 PDF 자동 생성은 아직 포함하지 않습니다.

`2026-10-28-k8s-ai-agent`는 `kcd2026/_final/*.md` 본문을 가져왔으며 발표자 노트를 제외했습니다.
한글 폰트는 패키지로 포함합니다. 모든 발표의 공개 빌드에도 `--without-notes`를 적용합니다.

## GitHub Pages

`.github/workflows/pages.yml`의 동작은 다음과 같습니다.

- PR: 의존성 설치, 검사, 전체 빌드. 배포 권한을 부여하지 않으며 배포하지 않습니다.
- `main` 반영: 같은 검사를 통과한 `dist/` 전체를 하나의 Pages artifact로 배포합니다.
- 수동 실행: `main`에서 실행할 때만 배포합니다.

실제 배포를 시작할 때 저장소 **Settings → Pages → Source → GitHub Actions**로 설정합니다.
예상 주소는 https://jmnote.github.io/slides/ 입니다.

`tooling/site/talks.yaml`의 `site.base`가 목록·발표·PDF·미리보기의 공통 기준 경로입니다.
커스텀 도메인 루트로 옮기는 경우 `/`로 변경하고 다시 빌드합니다.

## 의존성 참고

`tooling/pnpm-workspace.yaml`은 tooling 패키지의 pnpm 설정용입니다.
Slidev의 Monaco 하위 DOMPurify를 보안 패치 버전으로 고정합니다.
현재 `pnpm --dir tooling audit`에는 `pptxgenjs`의 `image-size` 관련 high 경고 2건이 남아 있습니다.
이 발표에서는 PPTX 내보내기를 사용하지 않으며, 해당 기능은 검증 범위에 포함하지 않았습니다.
