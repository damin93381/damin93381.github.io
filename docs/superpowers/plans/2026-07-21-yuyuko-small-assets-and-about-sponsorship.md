# Yuyuko Small Assets and About-page Sponsorship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the remaining visible Reimu small assets with the approved Yuyuko visual system and show the supplied WeChat payment QR code only on the About page.

**Architecture:** Two committed SVG marks provide the approved purple/light-blue balance and double-cherry motifs. The selected Windows cursor package is copied as two ignored local `.cur` files for browser cursor roles. The personal payment QR is also ignored and referenced only by the native, per-page Reimu sponsorship component.

**Tech Stack:** Hexo 8.1.2, Reimu 1.12.5, Node.js >=20.19.0, SVG, static `.cur` cursor files, JPEG.

## Global Constraints

- Keep all work local: no remote, GitHub Pages, Actions, deployment, or push.
- Keep the provided payment QR and cursor binaries out of Git history.
- Use `/mnt/c/Users/damin/Downloads/西行寺幽々子_マウスカーソル.zip` only as the local cursor-source archive.
- Use `/mnt/c/Users/damin/AppData/Local/Temp/codex-clipboard-a9ac1416-ea04-44a3-9e2c-7789f57ace2a.jpg` only as the local QR source image.
- Keep favicon outside this plan.
- Use the existing Node 22 runtime at `/home/drm/.local/opt/node-v22.23.1/bin` for tests.

---

### Task 1: Add approved SVG marks and local cursor mapping

**Files:**
- Create: `source/images/yuyuko-balance.svg`
- Create: `source/images/yuyuko-sakura-balance.svg`
- Create locally and ignore: `source/images/cursor/yuyuko-default.cur`
- Create locally and ignore: `source/images/cursor/yuyuko-pointer.cur`
- Modify: `.gitignore`
- Modify: `_config.reimu.yml`
- Modify: `test/verify-yuyuko-local-preview-assets.mjs`

**Interfaces:**
- Consumes: the user-selected A balance design, C double-cherry design, and cursor archive.
- Produces: `/images/yuyuko-balance.svg` for the preloader and top button; `/images/yuyuko-sakura-balance.svg` for the footer; two local cursor URLs referenced by generated CSS.

- [ ] **Step 1: Write failing generated-output assertions**

Append the following assertions after the existing 404 checks in `test/verify-yuyuko-local-preview-assets.mjs`:

```js
const style = readFileSync("public/css/style.css", "utf8");
for (const path of [
  "../images/yuyuko-balance.svg",
  "../images/yuyuko-sakura-balance.svg",
  "../images/cursor/yuyuko-default.cur",
  "../images/cursor/yuyuko-pointer.cur",
]) {
  assert.ok(style.includes(path), `generated CSS must reference ${path}`);
}
```

- [ ] **Step 2: Run the focused verifier and confirm it fails**

Run:

```bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH node test/verify-yuyuko-local-preview-assets.mjs
```

Expected: FAIL because generated CSS still references Reimu’s default taichi and cursor paths.

- [ ] **Step 3: Add the two approved SVG assets**

Create `source/images/yuyuko-balance.svg` as a 200×200 SVG containing a circular yin-yang construction: one lobe in `#7764c7` → `#a88de5`, the opposite lobe in `#69c9ee` → `#b9e8fa`, two contrasting circular eyes, and a white 5px outer ring.

Create `source/images/yuyuko-sakura-balance.svg` as a 200×200 SVG using the same yin-yang construction and outer ring, with a five-petal white blossom centred in each opposing lobe. The lower blossom centre is `#79d3ef`; the upper blossom centre is `#8d73ce`.

- [ ] **Step 4: Stage local cursor files without committing them**

Add these exact paths to `.gitignore`:

```gitignore
source/images/cursor/yuyuko-default.cur
source/images/cursor/yuyuko-pointer.cur
source/sponsor/wechat-payment.jpg
```

Extract the archive to a temporary directory. Copy its static `(arrow).cur` into `source/images/cursor/yuyuko-default.cur` and its static `(link).cur` into `source/images/cursor/yuyuko-pointer.cur`. Do not copy `.ani` files and do not stage either `.cur` file.

Validate:

```bash
test -s source/images/cursor/yuyuko-default.cur
test -s source/images/cursor/yuyuko-pointer.cur
git check-ignore -v source/images/cursor/yuyuko-default.cur source/images/cursor/yuyuko-pointer.cur
```

- [ ] **Step 5: Configure the approved visual roles**

In `_config.reimu.yml`, set the three icon roles and cursor map to:

```yaml
footer:
  icon:
    url: "../images/yuyuko-sakura-balance.svg"
    rotate: true
    mask: false

reimu_cursor:
  enable: true
  cursor:
    default: ../images/cursor/yuyuko-default.cur
    pointer: ../images/cursor/yuyuko-pointer.cur
    text: ../images/cursor/yuyuko-default.cur

preloader:
  icon: /images/yuyuko-balance.svg
  rotate: true

top:
  icon:
    url: "../images/yuyuko-balance.svg"
    rotate: true
    mask: false
```

Leave `sponsor` unchanged in this task.

- [ ] **Step 6: Run regression tests and inspect generated output**

Run:

```bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm test
test -f public/images/yuyuko-balance.svg
test -f public/images/yuyuko-sakura-balance.svg
rg -n 'yuyuko-(balance|sakura-balance)|yuyuko-(default|pointer)\.cur' public/css/style.css
git diff --check
```

Expected: PASS; no personal cursor binary appears in `git status --short`.

- [ ] **Step 7: Commit only tracked implementation and tests**

```bash
git add .gitignore _config.reimu.yml source/images/yuyuko-balance.svg source/images/yuyuko-sakura-balance.svg test/verify-yuyuko-local-preview-assets.mjs
git commit -m "feat: apply Yuyuko small asset system"
```

### Task 2: Enable local-only sponsorship on the About page

**Files:**
- Create locally and ignore: `source/sponsor/wechat-payment.jpg`
- Modify: `_config.reimu.yml`
- Modify: `source/about/index.md`
- Modify: `test/verify-yuyuko-local-preview-assets.mjs`

**Interfaces:**
- Consumes: the Task 1 double-cherry SVG and the supplied local QR image.
- Produces: one native Reimu sponsorship control on `/about/`, with `/sponsor/wechat-payment.jpg` as its only payment method.

- [ ] **Step 1: Add failing About-page isolation assertions**

Append these assertions to `test/verify-yuyuko-local-preview-assets.mjs`:

```js
const aboutPage = readFileSync("public/about/index.html", "utf8");
assert.match(aboutPage, /sponsor-wrapper/, "About page must render the native sponsor section");
assert.match(aboutPage, /\/sponsor\/wechat-payment\.jpg/, "About page must reference the local QR code");
for (const path of ["public/index.html", "public/2026/07/20/welcome/index.html"]) {
  assert.doesNotMatch(readFileSync(path, "utf8"), /sponsor-wrapper/, `${path} must not render sponsorship`);
}
```

- [ ] **Step 2: Run the verifier and confirm it fails**

Run:

```bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH node test/verify-yuyuko-local-preview-assets.mjs
```

Expected: FAIL because the About page does not yet opt into sponsorship.

- [ ] **Step 3: Stage the user-provided QR locally**

Create the parent directory and copy the exact local source:

```bash
mkdir -p source/sponsor
cp --preserve=timestamps /mnt/c/Users/damin/AppData/Local/Temp/codex-clipboard-a9ac1416-ea04-44a3-9e2c-7789f57ace2a.jpg source/sponsor/wechat-payment.jpg
test -s source/sponsor/wechat-payment.jpg
git check-ignore -v source/sponsor/wechat-payment.jpg
```

- [ ] **Step 4: Configure one native QR entry and opt in only on About**

Keep global sponsorship disabled and set its icon and QR list as follows in `_config.reimu.yml`:

```yaml
sponsor:
  enable: false
  tip:
    zh-CN: 请作者喝杯咖啡吧
  icon:
    url: "../images/yuyuko-sakura-balance.svg"
    rotate: false
    mask: false
  qr:
    - name: 微信支付
      src: /sponsor/wechat-payment.jpg
```

Add this exact field to the front matter in `source/about/index.md`:

```yaml
sponsor: true
```

- [ ] **Step 5: Run local-only verification and browser smoke test**

Run:

```bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm test
test -s public/sponsor/wechat-payment.jpg
git check-ignore -v source/sponsor/wechat-payment.jpg
test ! -d .github/workflows
rg -n '^deploy:|type:.*git|github\.io' _config.yml _config.reimu.yml README.md || true
```

Start a temporary Hexo server on port 4100, open `/about/`, click the sponsorship control, and confirm the WeChat QR expands. Confirm `/` and `/2026/07/20/welcome/` have no sponsorship control. Stop only that temporary 4100 listener afterward.

- [ ] **Step 6: Commit only the configuration, About opt-in, and test**

```bash
git add _config.reimu.yml source/about/index.md test/verify-yuyuko-local-preview-assets.mjs
git commit -m "feat: add local About-page sponsorship"
git status --short
```

Expected: `source/sponsor/wechat-payment.jpg` and the two `.cur` files remain ignored and uncommitted.

## Self-review

- Spec coverage: Task 1 implements the approved A top/preloader mark, C footer mark, and two-role cursor mapping; Task 2 implements one native About-only QR sponsorship control.
- Privacy coverage: every personal asset path is ignored, verified with `git check-ignore`, and excluded from both commits.
- Publication boundary: all verification keeps deployment disabled and introduces no remote configuration.
