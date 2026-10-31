.DEFAULT_GOAL := help

export TALK

.PHONY: help install dev build preview docs check

help:
	@printf '%s\n' \
	  'make install          의존성 설치 (고정된 lockfile)' \
	  'make dev              최신 Slidev 발표 실행' \
	  'make dev TALK=<id>    특정 발표 실행' \
	  'make build            사이트 전체 빌드' \
	  'make preview          빌드 결과 미리보기' \
	  'make docs             README 발표 목록 갱신' \
	  'make check            테스트·README 동기화·전체 빌드 검증'

install:
	pnpm --dir tooling install --frozen-lockfile

dev:
	pnpm --dir tooling dev $${TALK:+"$$TALK"}

build:
	pnpm --dir tooling build

preview:
	pnpm --dir tooling preview

docs:
	pnpm --dir tooling docs:update

check:
	pnpm --dir tooling check
