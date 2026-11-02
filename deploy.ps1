# Pull the latest site from GitHub and publish it to muhammadnada.com (Cloudflare Pages).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
git pull --ff-only
npx --yes wrangler@latest pages deploy . --project-name=muhammadnada --branch=main --commit-dirty=true
