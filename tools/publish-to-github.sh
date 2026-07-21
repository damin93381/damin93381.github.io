#!/usr/bin/env bash
# Commit all non-ignored blog changes and push the current branch to GitHub.
# Usage: bash tools/publish-to-github.sh [commit message]

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "错误：请在 Git 仓库中运行此脚本。" >&2
  exit 1
}
cd "$repo_root"

remote_name="origin"
branch_name="$(git branch --show-current)"

if [[ -z "$branch_name" ]]; then
  echo "错误：当前不在本地分支上，无法安全推送。" >&2
  exit 1
fi

if ! git remote get-url "$remote_name" >/dev/null 2>&1; then
  echo "错误：未配置远程 '$remote_name'，未进行暂存或提交。" >&2
  echo "请先执行：" >&2
  echo "  git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git" >&2
  exit 1
fi

if ! git diff --check; then
  echo "错误：存在空白字符错误，请修复后再提交。" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "以下未忽略的改动将被提交："
  git status --short
  printf '\n确认提交并推送到 %s/%s？[y/N] ' "$remote_name" "$branch_name"
  read -r confirmation

  if [[ "$confirmation" != "y" && "$confirmation" != "Y" ]]; then
    echo "已取消；未暂存、提交或推送。"
    exit 0
  fi

  commit_message="${1:-更新博客 $(date '+%Y-%m-%d %H:%M')}"
  git add -A
  git commit -m "$commit_message"
else
  echo "工作区没有需要提交的未忽略改动。"
fi

if git rev-parse --abbrev-ref '@{upstream}' >/dev/null 2>&1; then
  git push
else
  git push --set-upstream "$remote_name" "$branch_name"
fi

echo "完成：已推送到 $(git remote get-url "$remote_name")。"
