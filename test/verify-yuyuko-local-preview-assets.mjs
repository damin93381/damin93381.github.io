import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
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

execFileSync(process.execPath, ["node_modules/hexo-cli/bin/hexo", "generate"], {
  stdio: "inherit",
});

const htmlFiles = readdirSync("public", { recursive: true })
  .filter((path) => path.endsWith(".html"))
  .map((path) => `public/${path}`);
assert.ok(htmlFiles.length > 0, "Hexo must generate HTML output");

const homepage = readFileSync("public/index.html", "utf8");
for (const source of [
  "/avatar/yuyuko-avatar.webp",
  "/covers/yuyuko-cover.webp",
]) {
  assert.ok(
    homepage.includes(source),
    `public/index.html must reference ${source}`,
  );
}

for (const [media, source] of [
  ["(max-width: 479px)", "/images/yuyuko-banner-mobile.webp"],
  ["(max-width: 799px)", "/images/yuyuko-banner-mobile.webp"],
  ["(min-width: 800px)", "/images/yuyuko-banner.webp"],
]) {
  assert.ok(
    homepage.includes(`<source media="${media}" srcset="${source}">`),
    `public/index.html must contain ${media} -> ${source}`,
  );
}

for (const path of htmlFiles) {
  assert.doesNotMatch(
    readFileSync(path, "utf8"),
    /\/images\/banner\.webp/,
    `${path} must not reference Reimu's default banner`,
  );
}
