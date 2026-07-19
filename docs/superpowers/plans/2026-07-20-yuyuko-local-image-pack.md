# Yuyuko Local Preview Image Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the selected Yuyuko images as local-only Reimu preview assets without changing blog functionality or enabling publication.

**Architecture:** Source downloads remain in a gitignored staging directory; an image-processing script emits deterministic WebP assets into the Hexo source tree. Reimu configuration points only to those project-owned derived paths, while a source record holds the origin pages, authors, and pre-publication permission requirement.

**Tech Stack:** Node.js >=20.19.0, npm, sharp, Hexo, Reimu, WebP, Markdown, YAML.

## Global Constraints

- Use selected images only for local preview; do not create a remote, deploy, Pages, or Actions configuration.
- Preserve Reimu layout, functionality, content structure, colors, favicon, footer icon, top icon, preloader, and cursor assets.
- Desktop and mobile banners must derive from the same selected source image.
- Record the source page, author when known, and the statement “公开发布前需取得许可或替换” for every enabled image.
- Keep candidate-only images out of the generated public site.
- Tests run with Node >=20.19.0.

---

### Task 1: Add provenance manifest and local staging contract

**Files:**
- Create: `docs/assets/yuyuko-local-preview-sources.md`
- Create: `.gitignore` entry for `assets/yuyuko-local-preview-source/`
- Create: `assets/yuyuko-local-preview-source/README.md`
- Test: source manifest names each enabled asset and source page

**Interfaces:**
- Consumes: user-selected candidate IDs from `docs/superpowers/specs/2026-07-20-yuyuko-local-image-pack-design.md`
- Produces: staging filenames consumed by `scripts/build-yuyuko-local-preview-assets.mjs`

- [ ] **Step 1: Write the failing provenance check**

Create `test/verify-yuyuko-local-preview-assets.mjs` with assertions that the manifest contains the four enabled local filenames and the publication-permission warning.

~~~js
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const manifest = readFileSync("docs/assets/yuyuko-local-preview-sources.md", "utf8");
for (const filename of [
  "yuyuko-banner.webp",
  "yuyuko-avatar.webp",
  "yuyuko-cover.webp",
  "reimu.png",
]) assert.match(manifest, new RegExp(filename));
assert.match(manifest, /公开发布前需取得许可或替换/);
~~~

- [ ] **Step 2: Run the check and verify it fails**

Run: `node test/verify-yuyuko-local-preview-assets.mjs`

Expected: fail because the manifest does not exist.

- [ ] **Step 3: Create the source manifest and staging README**

The manifest must record these exact source pages and local purpose:

| Output filename | Source page | Author / attribution | Status |
| --- | --- | --- | --- |
| `source/images/yuyuko-banner.webp` and `source/images/yuyuko-banner-mobile.webp` | https://www.pixiv.net/en/artworks/127200026 | zzz / orchid-dale | 公开发布前需取得许可或替换 |
| `source/_data/avatar/yuyuko-avatar.webp` | https://thwiki.cc/index.php?setlang=zh&title=%E6%96%87%E4%BB%B6%3A%E8%A5%BF%E8%A1%8C%E5%AF%BA%E5%B9%BD%E5%B9%BD%E5%AD%90%EF%BC%88%E7%BB%AF%E6%83%B3%E5%A4%A9%E7%AB%8B%E7%BB%98%EF%BC%89.png | Touhou Hisoutensoku official standing art / Alphes | 公开发布前需取得许可或替换 |
| `source/_data/covers/yuyuko-cover.webp` | https://w.atwiki.jp/genlip/pages/132.html | Touhou Genso Eclipse game-card artwork; original author not confirmed | 公开发布前需取得许可或替换 |
| `source/images/reimu.png` | https://konachan.net/post/show/358002 | shirokuro (Pixiv 108644218) | 公开发布前需取得许可或替换 |

Create `assets/yuyuko-local-preview-source/README.md` stating that it is untracked local staging. Add its directory to `.gitignore`.

- [ ] **Step 4: Obtain local source files without hotlinking**

Use browser downloads from the source pages into these exact staging paths. Browser download is necessary because the selected Pixiv, THBWiki, and Atwiki pages block unauthenticated command-line retrieval.

~~~text
assets/yuyuko-local-preview-source/banner-original
assets/yuyuko-local-preview-source/avatar-original
assets/yuyuko-local-preview-source/cover-original
assets/yuyuko-local-preview-source/404-original
~~~

Validate each is an image, not an HTML challenge page:

~~~bash
file assets/yuyuko-local-preview-source/*-original
~~~

Expected: every file identifies an image format, never HTML/XML/text.

- [ ] **Step 5: Run the provenance check and commit**

Run: `node test/verify-yuyuko-local-preview-assets.mjs`

Expected: PASS.

~~~bash
git add .gitignore docs/assets/yuyuko-local-preview-sources.md assets/yuyuko-local-preview-source/README.md test/verify-yuyuko-local-preview-assets.mjs
git commit -m "docs: record local Yuyuko preview sources"
~~~

### Task 2: Generate deterministic local image derivatives

**Files:**
- Create: `scripts/build-yuyuko-local-preview-assets.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Generate: `source/images/yuyuko-banner.webp`, `source/images/yuyuko-banner-mobile.webp`, `source/_data/avatar/yuyuko-avatar.webp`, `source/_data/covers/yuyuko-cover.webp`, `source/images/reimu.png`
- Test: `test/verify-yuyuko-local-preview-assets.mjs`

**Interfaces:**
- Consumes: four exact files in `assets/yuyuko-local-preview-source/`
- Produces: five derived assets at fixed paths and dimensions

- [ ] **Step 1: Extend the test with image dimension assertions**

Use `sharp` metadata to assert the emitted dimensions.

~~~js
import sharp from "sharp";

const expectedDimensions = new Map([
  ["source/images/yuyuko-banner.webp", [2560, 1200]],
  ["source/images/yuyuko-banner-mobile.webp", [1440, 1080]],
  ["source/_data/avatar/yuyuko-avatar.webp", [600, 600]],
  ["source/_data/covers/yuyuko-cover.webp", [2400, 1350]],
  ["source/images/reimu.png", [2560, 1440]],
]);
for (const [path, [width, height]] of expectedDimensions) {
  const metadata = await sharp(path).metadata();
  assert.equal(metadata.width, width, path);
  assert.equal(metadata.height, height, path);
}
~~~

- [ ] **Step 2: Run the test and verify it fails**

Run: `node test/verify-yuyuko-local-preview-assets.mjs`

Expected: fail because sharp and output files are missing.

- [ ] **Step 3: Add sharp and image-build command**

Install the single development dependency and add this package script:

~~~bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm install --save-dev sharp
~~~

~~~json
"build:yuyuko-local-preview-assets": "node scripts/build-yuyuko-local-preview-assets.mjs"
~~~

- [ ] **Step 4: Implement the generator**

The generator must use `sharp(...).rotate()`, output quality 85, and use `fit: "cover"`. Its outputs must be:

~~~js
await sharp("assets/yuyuko-local-preview-source/banner-original")
  .rotate().resize(2560, 1200, { fit: "cover", position: "attention" })
  .webp({ quality: 85 }).toFile("source/images/yuyuko-banner.webp");
await sharp("assets/yuyuko-local-preview-source/banner-original")
  .rotate().resize(1440, 1080, { fit: "cover", position: "attention" })
  .webp({ quality: 85 }).toFile("source/images/yuyuko-banner-mobile.webp");
await sharp("assets/yuyuko-local-preview-source/avatar-original")
  .rotate().resize(600, 600, { fit: "cover", position: "attention" })
  .webp({ quality: 85 }).toFile("source/_data/avatar/yuyuko-avatar.webp");
await sharp("assets/yuyuko-local-preview-source/cover-original")
  .rotate().resize(2400, 1350, { fit: "cover", position: "attention" })
  .webp({ quality: 85 }).toFile("source/_data/covers/yuyuko-cover.webp");
await sharp("assets/yuyuko-local-preview-source/404-original")
  .rotate().resize(2560, 1440, { fit: "cover", position: "attention" })
  .png({ compressionLevel: 9 }).toFile("source/images/reimu.png");
~~~

- [ ] **Step 5: Build assets and run the image check**

~~~bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm run build:yuyuko-local-preview-assets
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH node test/verify-yuyuko-local-preview-assets.mjs
~~~

Expected: PASS.

- [ ] **Step 6: Commit generated assets and tooling**

~~~bash
git add package.json package-lock.json scripts/build-yuyuko-local-preview-assets.mjs test/verify-yuyuko-local-preview-assets.mjs source/images source/_data/avatar source/_data/covers
git commit -m "feat: add local Yuyuko preview assets"
~~~

### Task 3: Point Reimu at the local image pack

**Files:**
- Modify: `_config.reimu.yml`
- Test: `test/verify-yuyuko-local-preview-assets.mjs`

**Interfaces:**
- Consumes: Task 2 output assets
- Produces: Reimu image configuration using only local project assets

- [ ] **Step 1: Extend the test with config assertions**

~~~js
const config = readFileSync("_config.reimu.yml", "utf8");
assert.match(config, /banner: "\/images\/yuyuko-banner\.webp"/);
assert.match(config, /yuyuko-banner-mobile\.webp/);
assert.match(config, /avatar: "yuyuko-avatar\.webp"/);
assert.match(config, /cover: "\/covers\/yuyuko-cover\.webp"/);
~~~

- [ ] **Step 2: Run the test and verify it fails**

Run: `node test/verify-yuyuko-local-preview-assets.mjs`

Expected: fail because Reimu still points to the default banner/avatar.

- [ ] **Step 3: Update only image configuration**

Replace the relevant configuration with:

~~~yaml
banner: "/images/yuyuko-banner.webp"
banner_srcset:
  enable: true
  srcset:
    - src: "/images/yuyuko-banner-mobile.webp"
      media: "(max-width: 799px)"
    - src: "/images/yuyuko-banner.webp"
      media: "(min-width: 800px)"
avatar: "yuyuko-avatar.webp"
cover: "/covers/yuyuko-cover.webp"
~~~

Do not change favicon, footer icon, sponsor icon, top icon, preloader, or `reimu_cursor`.

- [ ] **Step 4: Run the check and production test**

~~~bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH node test/verify-yuyuko-local-preview-assets.mjs
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm test
~~~

Expected: both commands PASS.

- [ ] **Step 5: Commit configuration**

~~~bash
git add _config.reimu.yml test/verify-yuyuko-local-preview-assets.mjs
git commit -m "feat: apply local Yuyuko preview images"
~~~

### Task 4: Verify rendered local preview and publication boundary

**Files:**
- Test: built `public/` output and temporary local server
- No production file change expected

**Interfaces:**
- Consumes: complete local asset pack and Reimu configuration
- Produces: visual and automated proof of local-only integration

- [ ] **Step 1: Run build and automated checks**

~~~bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm test
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm run verify:yuyuko-local-preview
test ! -d .github/workflows
rg -n '^deploy:|type:.*git|github\.io' _config.yml _config.reimu.yml README.md || true
~~~

Expected: tests pass; `_config.yml` retains `deploy: type: ''`; no workflow directory exists.

- [ ] **Step 2: Start a temporary server with guaranteed cleanup**

~~~bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npx hexo server > /tmp/yuyuko-preview.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  curl --fail --silent http://127.0.0.1:4000/ > /tmp/yuyuko-home.html && break
  sleep 1
done
curl --fail --silent http://127.0.0.1:4000/404.html > /tmp/yuyuko-404.html
~~~

- [ ] **Step 3: Verify generated image references**

~~~bash
rg -n 'yuyuko-banner\.webp|yuyuko-banner-mobile\.webp|yuyuko-avatar\.webp|yuyuko-cover\.webp' public
test -f public/images/reimu.png
test -f public/avatar/yuyuko-avatar.webp
test -f public/covers/yuyuko-cover.webp
~~~

Expected: all commands exit 0.

- [ ] **Step 4: Manual visual checklist**

Open the home page in desktop width and mobile emulation, then verify:
- desktop and mobile headers show the same Yuyuko pose from independent crops;
- the avatar is a recognisable face-and-hat square crop within the existing sidebar circle;
- article cards use the selected cover;
- 404 uses the selected background;
- favicon, footer, top button, preloader, and cursor still use the old assets.

- [ ] **Step 5: Commit verification evidence only if a tracked test or document changed**

~~~bash
git status --short
git diff --check
~~~

## Self-review

- Spec coverage: the plan records the four selected sources, creates fixed-dimension local derivatives, preserves small icons, enables same-source responsive banners, verifies generated output, and forbids publication.
- Placeholder scan: each asset role has an explicit source page, staging filename, output filename, dimension, and verification command.
- Consistency: Task 2 produces every path consumed by Task 3; Task 4 verifies those same paths.

