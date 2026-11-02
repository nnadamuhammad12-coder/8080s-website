#!/usr/bin/env bash
# Pull the latest site from GitHub and publish it to muhammadnada.com (Cloudflare Pages).
set -e
cd "$(dirname "$0")"
git pull --ff-only
npx --yes wrangler@latest pages deploy . --project-name=8080s-website --branch=main --commit-dirty=true
