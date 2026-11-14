# jmnote.github.io

[jmnote.com](https://jmnote.com/) 소스입니다. 홈페이지와 발표 슬라이드(Slidev 덱·PDF)를 한 번에 빌드해 GitHub Pages로 배포합니다.

- 주소는 모두 `/<언어>/`로 시작합니다: `/en/`·`/ko/` 홈, `/en/slides/`·`/ko/slides/` 목록, `/<언어>/slides/<id>/` 덱, `/ko/slides/<연도>/<파일>.pdf` PDF. 루트 `/`는 저장된 선택 → 브라우저 언어 → 영어 순으로 언어를 골라 이동합니다.
- 홈 내용은 `tooling/site/home.yaml`, 발표 목록은 `tooling/site/talks.yaml`에서 관리합니다. 저장소 목록은 그룹 안에서 이름순으로 자동 정렬됩니다.
- `make site`로 전체 사이트 개발 서버, `make check`로 테스트·README 동기화·전체 빌드를 확인합니다.
- 릴리스: `VERSION`을 올려 `main`에 병합하면 `v<버전>` 태그와 GitHub 릴리스가 자동으로 만들어집니다(`.github/workflows/release.yml`).

## 발표

<!-- tooling/site/talks.yaml 수정 후 make docs로 갱신 -->
<!-- talks:start -->
| 제목 | 웹 | PDF | 날짜 | 행사 |
|---|:---:|:---:|---|---|
| Kubernetes 엔지니어가 둘러본 AI Agent 생태계 | [<img src="tooling/site/icons/globe.svg" width="20" height="20" alt="웹에서 보기">](https://jmnote.com/ko/slides/k8s-ai-agent/) | [<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2026/2026-10-28-k8s-ai-agent.pdf?raw=true) | 2026-10-28 | Kubernetes Korea Group Meetup 26.10 |
| Ingress Annotator 개발기 | — | [<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2025/2025-09-16-ingress-annotator.pdf?raw=true) | 2025-09-16 | Cloud Native Korea Community Day 2025 |
| Helm Chart 개발과 GitHub · ArtifactHub 사용기 | — | [<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2025/2025-05-22-helm-chart.pdf?raw=true) | 2025-05-22 | KCD Seoul 2025 |
| K8s LMA venti-stack 개발기: 파트 2 | — | [<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2024/2024-10-12-venti-stack-2.pdf?raw=true) | 2024-10-12 | GopherCon Korea 2024 |
| K8s LMA venti-stack 개발기 | — | [<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2024/2024-09-24-venti-stack.pdf?raw=true) | 2024-09-24 | Cloud Native Korea Community Day 2024 |
| Go 테스트의 거의 모든 것 | — | [<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2023/2023-08-05-go-tests.pdf?raw=true) | 2023-08-05 | GopherCon Korea 2023 |
| Cloud Native와 Samsung Cloud Platform | — | [<img src="tooling/site/icons/file-pdf-gray.svg" width="20" height="20" alt="PDF 다운로드">](2023/2023-07-12-cloud-native.pdf?raw=true) | 2023-07-12 | Open Cloud Platform Summit 2023 |
<!-- talks:end -->

[<img src="tooling/site/icons/globe.svg" width="20" height="20" alt=""> 슬라이드 사이트 보기](https://jmnote.com/ko/slides/)
