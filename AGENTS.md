# AGENTS.md

## Project list maintenance

- Keep repositories in `index.html` sorted alphabetically by repository name within each organization group.
- Keep the `jmnote` and `mailapi` organization groups in the existing order.
- Keep each organization in its own HTML table with `Repo` and `Description` columns.
- Run `./scripts/check-repo-order.sh` after changing the Repo list.

## Deployment

- GitHub Pages serves the `main` branch root directly.
- Do not add a deployment workflow unless the Pages deployment method changes.
