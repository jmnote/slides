# AGENTS.md

## Project list maintenance

- Keep repositories in `index.html` sorted alphabetically by repository name within each organization group.
- Keep the `jmnote` and `mailapi` organization groups in the existing order.
- Keep each organization in its own HTML table with `Repo` and `Description` columns.
- Run `./scripts/check-repo-order.sh` after changing the Repo list.

## Deployment

- GitHub Pages is deployed by `.github/workflows/pages.yml` (Source: GitHub Actions). It builds `dist/` with the profile site at the root and the presentations under `/slides/`.
- Presentations live in `slides/`: decks in `slides/YYYY-MM-DD-id/`, PDFs in `slides/pdf/`, tooling in `slides/tooling/` (see `slides/tooling/README.md`).
