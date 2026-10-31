.PHONY: checks serve

checks:
	./scripts/check-repo-order.sh
	npx --yes markdownlint-cli2 '**/*.md'
	npx --yes html-validate index.html
	npx --yes stylelint 'assets/**/*.css'
	docker run --rm -v "$(CURDIR):/input:ro" lycheeverse/lychee:latest \
		--verbose --no-progress /input/index.html /input/README.md

serve:
	npx --yes live-server . --host=127.0.0.1 --port=3000
