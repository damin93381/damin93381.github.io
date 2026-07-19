import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import sharp from "sharp";

const manifest = readFileSync("docs/assets/yuyuko-local-preview-sources.md", "utf8");
for (const filename of [
  "yuyuko-banner.webp",
  "yuyuko-avatar.webp",
  "yuyuko-cover.webp",
  "reimu.png",
]) assert.match(manifest, new RegExp(filename));
assert.match(manifest, /公开发布前需取得许可或替换/);

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
