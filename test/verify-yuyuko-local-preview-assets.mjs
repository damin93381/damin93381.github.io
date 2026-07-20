import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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
const aboutPage = readFileSync("public/about/index.html", "utf8");
assert.match(aboutPage, /sponsor-wrapper/, "About page must render the native sponsor section");
assert.match(aboutPage, /\/sponsor\/wechat-payment\.jpg/, "About page must reference the local QR code");
for (const phrase of ["方法与阅读", "日常生活的片段", "长期兴趣沉淀为", "个人档案。"]) {
  assert.match(aboutPage, new RegExp(`<span style="white-space: nowrap;">${phrase}<\\/span>`), `${phrase} must not break on narrow screens`);
}
for (const path of ["public/index.html", "public/2026/07/20/welcome/index.html"]) {
  assert.doesNotMatch(readFileSync(path, "utf8"), /sponsor-wrapper/, `${path} must not render sponsorship`);
}
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
const themeConfig = readFileSync("_config.reimu.yml", "utf8");

assert.match(
  themeConfig,
  /footer:\n(?:[^\n]*\n)*?  icon:\n    url: "\.\.\/images\/yuyuko-sakura-balance\.svg"[^\n]*\n    rotate: true\n    mask: false/,
  "footer must use the unmasked rotating sakura balance icon",
);
assert.match(
  themeConfig,
  /top:\n(?:[^\n]*\n)*?  icon:\n    url: "\.\.\/images\/yuyuko-balance\.svg"[^\n]*\n    rotate: true\n    mask: false/,
  "top control must use the unmasked rotating balance icon",
);
assert.match(
  themeConfig,
  /reimu_cursor:\n  enable: true\n  cursor:\n    default: \.\.\/images\/cursor\/yuyuko-default\.cur[^\n]*\n    pointer: \.\.\/images\/cursor\/yuyuko-pointer\.cur\n    text: \.\.\/images\/cursor\/yuyuko-default\.cur/,
  "cursor roles must use the intended local cursor files",
);

for (const [mapping, expected] of [
  ["--cursor-default", 'url("../images/cursor/yuyuko-default.cur"), auto'],
  ["--cursor-pointer", 'url("../images/cursor/yuyuko-pointer.cur"), pointer'],
  ["--cursor-text", 'url("../images/cursor/yuyuko-default.cur"), text'],
  ["--footer-icon", 'url("../images/yuyuko-sakura-balance.svg")'],
  ["--top-icon", 'url("../images/yuyuko-balance.svg")'],
]) {
  assert.ok(
    style.includes(`${mapping}: ${expected};`),
    `generated CSS must map ${mapping} to ${expected}`,
  );
}
assert.match(style, /\.footer-info-sep\.rotate \{\n  animation: rotate-all 3s linear infinite;\n\}/);
assert.match(style, /\.footer-info-sep \{\n  background: var\(--footer-icon\) no-repeat center\/80%;\n\}/);
assert.match(style, /\.sidebar-top \.sidebar-top-taichi\.rotate \{\n  animation: rotate-all 3s linear infinite;\n\}/);
assert.match(style, /\.sidebar-top-taichi \{\n  background: var\(--top-icon\) no-repeat center\/100%;\n\}/);

assert.match(
  homepage,
  /<div class="loading-taichi rotate">\s*<img src="\/images\/yuyuko-balance\.svg" alt="loading" \/>/,
  "generated preloader must use the balance SVG",
);

for (const filename of ["yuyuko-balance.svg", "yuyuko-sakura-balance.svg"]) {
  const sourcePath = `source/images/${filename}`;
  const sourceSvg = readFileSync(sourcePath, "utf8");
  const outputPath = `public/images/${filename}`;
  assert.ok(existsSync(outputPath), `generated ${filename} must exist`);
  assert.equal(readFileSync(outputPath, "utf8"), sourceSvg, `generated ${filename} must match its source`);
  assert.match(sourceSvg, /viewBox="0 0 200 200" width="200" height="200"/);
  assert.match(sourceSvg, /#7764c7/);
  assert.match(sourceSvg, /#a88de5/);
  assert.match(sourceSvg, /#69c9ee/);
  assert.match(sourceSvg, /#b9e8fa/);
  assert.match(sourceSvg, /stroke="#fff" stroke-width="5"/);
}

const blossomGroups = [
  ["100 59", "#8d73ce"],
  ["100 141", "#79d3ef"],
];
for (const path of [
  "source/images/yuyuko-sakura-balance.svg",
  "public/images/yuyuko-sakura-balance.svg",
]) {
  const sakuraSvg = readFileSync(path, "utf8");
  assert.equal(
    (sakuraSvg.match(/<g transform="translate\(100 (?:59|141)\)" fill="#fff">/g) ?? []).length,
    2,
    `${path} must contain exactly two blossom groups`,
  );
  for (const [center, color] of blossomGroups) {
    assert.match(
      sakuraSvg,
      new RegExp(
        `<g transform="translate\\(${center}\\)" fill="#fff">\\s*`
        + `<use href="#petal"\\/><use href="#petal" transform="rotate\\(72\\)"\\/>`
        + `<use href="#petal" transform="rotate\\(144\\)"\\/><use href="#petal" transform="rotate\\(216\\)"\\/>`
        + `<use href="#petal" transform="rotate\\(288\\)"\\/>\\s*<circle r="7" fill="${color}"\\/>\\s*<\\/g>`,
      ),
      `${path} must contain a five-petal blossom centered at ${center} with center ${color}`,
    );
  }
}

const balanceSvg = readFileSync("source/images/yuyuko-balance.svg", "utf8");
assert.match(balanceSvg, /<circle cx="100" cy="59" r="15" fill="url\(#violet\)"\/>/);
assert.match(balanceSvg, /<circle cx="100" cy="141" r="15" fill="url\(#sky\)"\/>/);

const { data: balancePixels, info: balanceInfo } = await sharp(Buffer.from(balanceSvg))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const pixelAt = (x, y) => balancePixels.subarray(
  (y * balanceInfo.width + x) * balanceInfo.channels,
  (y * balanceInfo.width + x + 1) * balanceInfo.channels,
);
const rgbDistance = (first, second) => Math.hypot(
  first[0] - second[0],
  first[1] - second[1],
  first[2] - second[2],
);
for (const [eye, lobe] of [[[100, 59], [117, 59]], [[100, 141], [117, 141]]]) {
  assert.ok(
    rgbDistance(pixelAt(...eye), pixelAt(...lobe)) > 70,
    `eye at ${eye.join(",")} must visibly contrast with its adjacent lobe`,
  );
}
