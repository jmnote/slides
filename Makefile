.DEFAULT_GOAL := help

export TALK

.PHONY: help install dev site build preview docs check

help:
	@printf '%s\n' \
	  'make install          의존성 설치 (고정된 lockfile)' \
	  'make dev              최신 Slidev 발표 실행' \
	  'make dev TALK=<id>    특정 발표 실행' \
	  'make site             사이트 전체 개발 서버 (홈·목록·모든 발표·쇼케이스, 실시간 반영)' \
	  'make build            사이트 전체 빌드' \
	  'make preview          로컬 미리보기 (템플릿 쇼케이스 포함, dist-preview/에 빌드, dist/는 그대로)' \
	  'make docs             README 발표 목록 갱신' \
	  'make check            테스트·README 동기화·전체 빌드 검증'

install:
	pnpm --dir tooling install --frozen-lockfile

dev:
	pnpm --dir tooling dev $${TALK:+"$$TALK"}

site:
	pnpm --dir tooling site

build:
	pnpm --dir tooling build

preview:
	pnpm --dir tooling build --with-showcase
	pnpm --dir tooling preview --with-showcase

docs:
	pnpm --dir tooling docs:update

check:
	pnpm --dir tooling check


