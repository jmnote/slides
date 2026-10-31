# jmnote.github.io

Source repository for [jmnote.com](https://jmnote.com), a small
static profile page hosted on GitHub Pages.

The page content lives in [`index.html`](index.html). This README is intended
for people working on or deploying the repository.

## Run locally

The page is plain HTML and CSS, with a small JavaScript file for theme
switching. Run the repo-order, Markdown, HTML, and link checks locally
with:

```sh
make checks
```

To start a local server with live reload:

```sh
make serve
```

Then open `http://localhost:3000`.

## Repository structure

```text
.
├── .github/workflows/ # CI, Pages deployment, release
├── index.html   # Profile page content and metadata
├── assets/      # CSS, JavaScript, and SVG assets
├── scripts/     # Repository validation scripts
├── CNAME        # Custom domain (jmnote.com)
├── slides/      # Presentations: decks, pdf/, tooling/ (see slides/README.md)
├── README.md    # Repository documentation
├── .stylelintrc.json # CSS validation rules
├── package.json  # Release version
├── Makefile     # Local checks, preview, and slides build commands
└── LICENSE      # Apache License 2.0
```

## Deployment

Pushing to `main` runs the Pages workflow, which builds one artifact: the profile
site at the root and the presentations under `/slides/`. The live site is
available at [jmnote.com](https://jmnote.com). See
[`slides/tooling/README.md`](slides/tooling/README.md) for the slides build.

## Releases

Update the version in [`package.json`](package.json) when preparing a release.
Merging that change into `main` creates the corresponding Git tag and GitHub
Release automatically.

## Continuous integration

Pull requests are checked for valid links, HTML, CSS, and Markdown style, and
alphabetical Repo ordering. Run `make checks` locally to run the same checks.
The slides tests, README sync, and full site build run with `make slides-check`.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
