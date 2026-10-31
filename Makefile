.DEFAULT_GOAL := help

export TALK

.PHONY: help checks serve slides-install slides-dev slides-build slides-preview slides-docs slides-check check

help:
	@printf '%s\n' \
	  'make checks           프로필 사이트 검사 (repo 순서·Markdown·HTML·CSS·링크)' \
	  'make serve            프로필 사이트 로컬 서버 (live reload)' \
	  'make slides-install   발표 의존성 설치 (고정된 lockfile)' \
	  'make slides-dev       최신 Slidev 발표 실행 (TALK=<id>로 선택)' \
	  'make slides-build     통합 사이트 빌드 (dist/: 프로필 + dist/slides/)' \
	  'make slides-preview   빌드 결과 미리보기' \
	  'make slides-docs      slides/README.md 발표 목록 갱신' \
	  'make slides-check     발표 테스트·README 동기화·전체 빌드 검증' \
	  'make check            checks + slides-check'

checks:
	./scripts/check-repo-order.sh
	npx --yes markdownlint-cli2 '**/*.md'
	npx --yes html-validate index.html
	npx --yes stylelint 'assets/**/*.css'
	docker run --rm -v "$(CURDIR):/input:ro" lycheeverse/lychee:latest \
		--verbose --no-progress --root-dir /input /input/index.html /input/README.md

serve:
	npx --yes live-server . --host=127.0.0.1 --port=3000

slides-install:
	pnpm --dir slides/tooling install --frozen-lockfile

slides-dev:
	pnpm --dir slides/tooling dev $${TALK:+"$$TALK"}

slides-build:
	pnpm --dir slides/tooling build

slides-preview:
	pnpm --dir slides/tooling preview

slides-docs:
	pnpm --dir slides/tooling docs:update

slides-check:
	pnpm --dir slides/tooling check

check: checks slides-check
