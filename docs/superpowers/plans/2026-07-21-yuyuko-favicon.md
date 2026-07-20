# Yuyuko Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Reimu's default browser favicon with the user-selected full-frame pixel-art Yuyuko favicon in local preview.

**Architecture:** Store the original user image in the existing ignored local staging directory. A small Node/Sharp build script creates one ICO container holding 16×16, 32×32, and 48×48 PNG entries, which Reimu references through its existing favicon setting. The regression verifier builds Hexo and checks both ICO structure and generated HTML.

**Tech Stack:** Node.js 22, Sharp, Hexo, Reimu, Node standard-library binary buffers.

## Global Constraints

- Read the source image only from `assets/yuyuko-local-preview-source/favicon-original.png`; it must remain ignored and uncommitted.
- Preserve the full square artwork with no crop, redraw, or generative image modification.
- Produce `source/images/yuyuko-favicon.ico` with 16×16, 32×32, and 48×48 entries.
- Change only the favicon configuration and its direct build/test/provenance files.
- Preserve all other Yuyuko image assignments, the footer icon, top icon, cursor assets, loader, site functionality, and local-only publication boundary.
- Run all tests using Node.js >=20.19.0.

---

### Task 1: Generate and wire the local favicon

**Files:**
- Create: `scripts/build-yuyuko-favicon.mjs`
- Create: `source/images/yuyuko-favicon.ico`
- Modify: `_config.reimu.yml`
- Modify: `docs/assets/yuyuko-local-preview-sources.md`

**Interfaces:**
- Consumes: ignored `assets/yuyuko-local-preview-source/favicon-original.png`.
- Produces: an ICO at `source/images/yuyuko-favicon.ico` consumed by `favicon: "/images/yuyuko-favicon.ico"`.

- [ ] **Step 1: Stage the user-selected local source without committing it**

Run:

```bash
cp '/mnt/c/Users/damin/Downloads/ChatGPT Image 2026年7月21日 01_37_33.png' \
  assets/yuyuko-local-preview-source/favicon-original.png
file assets/yuyuko-local-preview-source/favicon-original.png
```

Expected: `PNG image data` and no staged Git change for the source image.

- [ ] **Step 2: Add the favicon builder**

Create `scripts/build-yuyuko-favicon.mjs` with this complete implementation:

```js
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = "assets/yuyuko-local-preview-source/favicon-original.png";
const output = "source/images/yuyuko-favicon.ico";
const sizes = [16, 32, 48];
const images = await Promise.all(
  sizes.map((size) => sharp(source).resize(size, size, { fit: "fill" }).png().toBuffer()),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + images.length * 16;
const entries = images.map((image, index) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[index], 0);
  entry.writeUInt8(sizes[index], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  return entry;
});
await mkdir("source/images", { recursive: true });
await writeFile(output, Buffer.concat([header, ...entries, ...images]));
```

- [ ] **Step 3: Generate and inspect the favicon**

Run:

```bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH node scripts/build-yuyuko-favicon.mjs
file source/images/yuyuko-favicon.ico
```

Expected: an ICO file containing three images.

- [ ] **Step 4: Point Reimu to the generated local favicon**

Replace the existing `favicon` setting with:

```yaml
favicon: "/images/yuyuko-favicon.ico"
```

- [ ] **Step 5: Record provenance**

Add this row to `docs/assets/yuyuko-local-preview-sources.md`:

```markdown
| `source/images/yuyuko-favicon.ico` | User-provided `ChatGPT Image 2026年7月21日 01_37_33.png` | User-selected pixel-art Yuyuko image | 本地预览使用；公开发布前确认生成图的使用权 |
```

---

### Task 2: Add generated-output regression coverage and verify local preview

**Files:**
- Modify: `test/verify-yuyuko-local-preview-assets.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `source/images/yuyuko-favicon.ico` and generated `public/index.html`.
- Produces: an `npm test` regression gate for favicon dimensions and local generated HTML reference.

- [ ] **Step 1: Add a build command**

Add this package script:

```json
"build:yuyuko-favicon": "node scripts/build-yuyuko-favicon.mjs"
```

- [ ] **Step 2: Extend the verifier before running the full suite**

Add `readFileSync("source/images/yuyuko-favicon.ico")` checks that assert:

```js
assert.equal(favicon.readUInt16LE(0), 0);
assert.equal(favicon.readUInt16LE(2), 1);
assert.equal(favicon.readUInt16LE(4), 3);
assert.deepEqual([6, 22, 38].map((offset) => favicon.readUInt8(offset)), [16, 32, 48]);
```

After Hexo generate, assert every generated HTML page references `/images/yuyuko-favicon.ico` and none references `/images/favicon.ico`.

- [ ] **Step 3: Run the complete automated check**

Run:

```bash
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm run build:yuyuko-favicon
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm test
git diff --check
```

Expected: all commands exit zero.

- [ ] **Step 4: Verify the active local preview without publishing**

Run:

```bash
curl --fail --silent http://127.0.0.1:4000/ | rg 'yuyuko-favicon\.ico'
test ! -d .github/workflows
rg -n '^deploy:|type:.*git|github\.io' _config.yml _config.reimu.yml README.md || true
```

Expected: the local page references the new favicon, no workflow directory exists, and deploy remains disabled.

- [ ] **Step 5: Commit the cohesive implementation**

```bash
git add _config.reimu.yml package.json scripts/build-yuyuko-favicon.mjs \
  source/images/yuyuko-favicon.ico test/verify-yuyuko-local-preview-assets.mjs \
  docs/assets/yuyuko-local-preview-sources.md
git commit -m "feat: add local Yuyuko favicon"
```

## Self-review

- Spec coverage: Tasks 1 and 2 cover the selected full-frame source, three required ICO sizes, Reimu configuration, provenance, generated HTML, local-preview verification, and the local-only boundary.
- Placeholder scan: no task contains an unspecified implementation or test step.
- Consistency: Task 1 creates the exact staged input and ICO path consumed by Task 2 and Reimu configuration.
