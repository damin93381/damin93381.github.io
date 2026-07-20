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

const favicon = readFileSync("source/images/yuyuko-favicon.ico");
assert.equal(favicon.readUInt16LE(0), 0);
assert.equal(favicon.readUInt16LE(2), 1);
assert.equal(favicon.readUInt16LE(4), 3);
assert.deepEqual(
  [6, 22, 38].map((offset) => favicon.readUInt8(offset)),
  [16, 32, 48],
);
for (const offset of [6, 22, 38]) {
  const width = favicon.readUInt8(offset);
  const height = favicon.readUInt8(offset + 1);
  const size = favicon.readUInt32LE(offset + 8);
  const frameOffset = favicon.readUInt32LE(offset + 12);
  const metadata = await sharp(favicon.subarray(frameOffset, frameOffset + size)).metadata();
  assert.equal(metadata.width, width, `favicon frame at ${offset} must match its directory width`);
  assert.equal(metadata.height, height, `favicon frame at ${offset} must match its directory height`);
}

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

const cardCoverSources = [...homepage.matchAll(
  /<div class="post-cover[^>]*>\s*<img data-src="([^"]+)"/g,
)].map((match) => match[1]);
assert.equal(cardCoverSources.length, 3, "homepage must render all starter post covers");
assert.ok(
  cardCoverSources.every((source) => source === "/covers/yuyuko-cover.webp"),
  "homepage cards must consistently use the selected local Yuyuko cover",
);
assert.doesNotMatch(
  homepage,
  /d-sketon\.top\/img\/_backwebp\/bg1\.webp/,
  "homepage must not retain Reimu's remote random-cover entry",
);

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
  const html = readFileSync(path, "utf8");
  assert.ok(
    html.includes("/images/yuyuko-favicon.ico"),
    `${path} must reference the local Yuyuko favicon`,
  );
  assert.doesNotMatch(
    html,
    /\/images\/favicon\.ico/,
    `${path} must not reference Reimu's default favicon`,
  );
  assert.doesNotMatch(
    html,
    /\/images\/banner\.webp/,
    `${path} must not reference Reimu's default banner`,
  );
}

const notFoundPage = readFileSync("public/404.html", "utf8");
assert.match(
  notFoundPage,
  /<img\s+fetchpriority="high"\s+src="\/images\/reimu\.png"\s+alt="">/,
  "404 must use the selected dedicated local artwork",
);
assert.doesNotMatch(
  notFoundPage,
  /<source media="[^"]+" srcset="\/images\/yuyuko-banner(?:-mobile)?\.webp">/,
  "404 header must not fall back to the global banner source set",
);

const style = readFileSync("public/css/style.css", "utf8");
for (const path of [
  "../images/yuyuko-balance.svg",
  "../images/yuyuko-sakura-balance.svg",
  "../images/cursor/yuyuko-default.cur",
  "../images/cursor/yuyuko-pointer.cur",
]) {
  assert.ok(style.includes(path), `generated CSS must reference ${path}`);
}
