#!/usr/bin/env bash

set -euo pipefail

page="index.html"

check_group() {
  local group="$1"
  local next_group="$2"
  local actual expected

  actual=$(sed -n "/<h3><a href=\"https:\\/\\/github.com\\/$group\">/,/<h3><a href=\"https:\\/\\/github.com\\/$next_group\">/p" "$page" \
    | sed -n 's/.*<tr><td><a href="[^"]*">\([^<]*\)<\/a><\/td>.*/\1/p')
  expected=$(printf '%s\n' "$actual" | LC_ALL=C sort -f)

  if [[ "$actual" != "$expected" ]]; then
    echo "$group repositories are not sorted alphabetically:" >&2
    diff -u <(printf '%s\n' "$expected") <(printf '%s\n' "$actual") >&2 || true
    exit 1
  fi
}

check_group 'jmnote' 'mailapi'

actual=$(sed -n '/<h3><a href="https:\/\/github.com\/mailapi">/,$p' "$page" \
  | sed -n 's/.*<tr><td><a href="[^"]*">\([^<]*\)<\/a><\/td>.*/\1/p')
expected=$(printf '%s\n' "$actual" | LC_ALL=C sort -f)

if [[ "$actual" != "$expected" ]]; then
  echo 'mailapi repositories are not sorted alphabetically:' >&2
  diff -u <(printf '%s\n' "$expected") <(printf '%s\n' "$actual") >&2 || true
  exit 1
fi

echo 'Repo order is valid.'
