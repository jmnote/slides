# jmnote.github.io

Source repository for [jmnote.github.io](https://jmnote.github.io), a small
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
├── .github/workflows/ci.yml # PR validation workflow
├── index.html   # Profile page content and metadata
├── assets/      # CSS, JavaScript, and SVG assets
├── scripts/     # Repository validation scripts
├── README.md    # Repository documentation
├── .stylelintrc.json # CSS validation rules
├── package.json  # Release version
├── Makefile     # Local checks and preview commands
└── LICENSE      # Apache License 2.0
```

## Deployment

Push changes to the repository and publish the site through GitHub Pages.
The live page is available at [jmnote.github.io](https://jmnote.github.io).

## Releases

Update the version in [`package.json`](package.json) when preparing a release.
Merging that change into `main` creates the corresponding Git tag and GitHub
Release automatically.

## Continuous integration

Pull requests are checked for valid links, HTML, CSS, and Markdown style, and
alphabetical Repo ordering. Run `make checks` locally to run the same checks.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
