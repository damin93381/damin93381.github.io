# Local Reimu Research Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a locally previewable Reimu/Hexo blog for `damin93381` covering computational chemistry, materials science, technical practice, and everyday notes.

**Architecture:** Copy the official `D-Sketon/reimu-template` into this repository while retaining the committed project documentation. Root YAML config supplies site identity; Markdown under `source/` provides content; Hexo serves the rendered output locally.

**Tech Stack:** Node.js, npm, Hexo 8, hexo-theme-reimu 1.12.5, Markdown, YAML.

## Global Constraints

- Preserve Reimu's original visual language and interaction model.
- Do not add GitHub repositories, deployment configuration, Pages, or Actions.
- Use `damin93381` and `https://github.com/damin93381` as the only identity/profile data.
- Do not invent biography, institution, contact information, or personal imagery.
- Verify with production build plus a local HTTP preview.

---

### Task 1: Initialize the official local Hexo/Reimu template

**Files:**
- Create: root Hexo project files, `themes/`, `scaffolds/`, and `source/` from the official template
- Preserve: `docs/superpowers/`
- Test: `npm run build`

**Interfaces:**
- Consumes: `https://github.com/D-Sketon/reimu-template.git`
- Produces: root scripts `npm run build` and `npm run server`

- [ ] **Step 1: Copy the upstream template without its Git history or `.github` directory**

```bash
template_dir=$(mktemp -d)
git clone --depth 1 https://github.com/D-Sketon/reimu-template.git "$template_dir"
rsync -a --exclude .git --exclude .github "$template_dir"/ ./
rm -rf "$template_dir"
```

- [ ] **Step 2: Install dependencies and validate the baseline build**

```bash
npm install
npm run build
```

Expected: exit code 0 and generated files in `public/`.

- [ ] **Step 3: Commit the template baseline**

```bash
git add . ':!public' ':!node_modules'
git commit -m "chore: initialize Reimu Hexo template"
```

### Task 2: Configure the research-blog identity

**Files:**
- Modify: `_config.yml`
- Modify: `_config.reimu.yml`
- Test: `public/index.html` includes title, subtitle, and GitHub URL

**Interfaces:**
- Consumes: Task 1 configuration files
- Produces: Chinese-language Reimu identity, navigation, and social link

- [ ] **Step 1: Replace site metadata in `_config.yml`**

```yaml
title: damin93381
subtitle: '计算化学、材料科学与日常记录'
description: '记录计算化学、材料科学、技术实践与日常思考。'
keywords: 计算化学,材料科学,科研笔记,技术实践,日常记录
author: damin93381
language: zh-CN
timezone: Asia/Shanghai
url: http://localhost:4000
```

- [ ] **Step 2: Replace only Reimu's author, subtitle, avatar, social, and menu fields in `_config.reimu.yml`**

```yaml
author: damin93381
avatar: false
subtitle: 计算化学、材料科学与日常记录
social:
  github: https://github.com/damin93381
menu:
  home: / || fa-solid fa-house
  about: /about/ || fa-solid fa-user
  categories: /categories/ || fa-solid fa-folder-tree
  tags: /tags/ || fa-solid fa-tags
  archives: /archives/ || fa-solid fa-box-archive
```

- [ ] **Step 3: Build and check generated metadata**

```bash
npm run build
rg -n 'damin93381|计算化学、材料科学与日常记录|github.com/damin93381' public/index.html
```

Expected: all three values appear.

- [ ] **Step 4: Commit the configuration**

```bash
git add _config.yml _config.reimu.yml
git commit -m "feat: configure research blog identity"
```

### Task 3: Add research and personal-record content

**Files:**
- Create: `source/about/index.md`, `source/categories/index.md`, `source/tags/index.md`, `source/archives/index.md`
- Create: `source/_posts/2026-07-20-welcome.md`
- Test: generated route files

**Interfaces:**
- Consumes: Task 2 site configuration and Hexo Markdown front matter
- Produces: navigable native Reimu pages and one categorized opening post

- [ ] **Step 1: Create the About page**

```markdown
---
title: 关于
date: 2026-07-20 00:00:00
---

这里记录计算化学与材料科学中的问题、方法与阅读，也保存技术实践和日常生活的片段。

希望把零散的想法、计算过程和长期兴趣沉淀为可回顾、可复用的个人档案。
```

- [ ] **Step 2: Create category, tag, and archive index pages**

```markdown
---
title: 分类
type: categories
---
```

```markdown
---
title: 标签
type: tags
---
```

```markdown
---
title: 归档
type: archives
---
```

- [ ] **Step 3: Create the opening post**

```markdown
---
title: 从这里开始：科研、技术与日常的长期记录
date: 2026-07-20 00:00:00
categories:
  - 科研笔记
tags:
  - 计算化学
  - 材料科学
  - 博客
---

这是这个博客的第一篇记录。

我会在这里整理计算化学与材料科学的学习、计算和阅读，也会记录工具实践，以及研究之外值得保存的日常片段。

## 想记录什么

- 科研笔记：理论、方法、文献与计算过程。
- 技术实践：脚本、环境、数据处理和工作流。
- 日常记录：让研究生活保持完整的观察与思考。
```

- [ ] **Step 4: Build and assert the routes**

```bash
npm run build
test -f public/about/index.html
test -f public/categories/index.html
test -f public/tags/index.html
test -f public/archives/index.html
test -f public/2026/07/20/welcome/index.html
```

Expected: every assertion exits with code 0.

- [ ] **Step 5: Commit starter content**

```bash
git add source
git commit -m "feat: add research blog starter content"
```

### Task 4: Verify the local-only site

**Files:**
- Modify: `README.md` with accurate preview instructions if they are missing
- Test: clean build, local server response, and absent publishing automation

**Interfaces:**
- Consumes: Tasks 1–3
- Produces: documented, verified local preview only

- [ ] **Step 1: Run a clean build**

```bash
npm run clean
npm run build
```

- [ ] **Step 2: Verify home and about through a temporary local server**

```bash
npm run server > /tmp/damin93381-hexo-server.log 2>&1 &
server_pid=$!
sleep 5
curl --fail --silent http://127.0.0.1:4000/ > /tmp/damin93381-home.html
curl --fail --silent http://127.0.0.1:4000/about/ > /tmp/damin93381-about.html
kill "$server_pid"
```

Expected: both requests succeed and the server is stopped.

- [ ] **Step 3: Confirm no publishing automation or active deployment is present**

```bash
test ! -d .github/workflows
rg -n '^deploy:|type:.*git|github\.io' _config.yml _config.reimu.yml README.md || true
```

Expected: `_config.yml` retains `deploy: type: ''`; no workflow directory exists.

- [ ] **Step 4: Commit documentation if changed**

```bash
git add README.md
git diff --cached --quiet || git commit -m "docs: explain local blog preview"
```

## Self-review

- Spec coverage: Tasks 1–4 implement the local template, research-oriented identity, specified content, build/server validation, and no-publish boundary.
- Placeholder scan: no unspecified implementation items remain.
- Consistency: the route assertions in Task 3 match the pages created in that task, while Task 4 depends only on completed tasks.
