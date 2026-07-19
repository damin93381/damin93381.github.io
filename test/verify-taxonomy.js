const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const publicRoot = path.resolve(__dirname, "..", "public");
const siteOrigin = "http://local.test";
const requiredCategoryRoutes = new Map([
  ["科研笔记", "/categories/科研笔记/"],
  ["技术实践", "/categories/技术实践/"],
  ["日常记录", "/categories/日常记录/"],
]);

function extractLinks(html, linkClass) {
  return Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g))
    .map((match) => {
      const attributes = Object.fromEntries(
        Array.from(match[1].matchAll(/\b([\w:-]+)=(['"])(.*?)\2/g), (attribute) => [
          attribute[1],
          attribute[3],
        ]),
      );

      return {
        classes: (attributes.class || "").split(/\s+/),
        href: attributes.href,
        text: match[2].replace(/<[^>]+>/g, "").trim(),
      };
    })
    .filter((link) => link.classes.includes(linkClass));
}

function readListing(relativePath, linkClass) {
  const listingPath = path.join(publicRoot, relativePath);
  const html = readFileSync(listingPath, "utf8");
  const links = extractLinks(html, linkClass);

  assert.ok(links.length > 0, `${relativePath} has no native Reimu taxonomy links`);
  return links;
}

function targetPath(href) {
  const url = new URL(href, siteOrigin);
  assert.equal(url.origin, siteOrigin, `taxonomy link must be local: ${href}`);

  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname.replace(/^\/+/, "");
  return pathname.endsWith("/")
    ? path.join(publicRoot, relativePath, "index.html")
    : path.join(publicRoot, relativePath);
}

// Given: a freshly generated Hexo site.
const categoryLinks = readListing("categories/index.html", "archives-category-list-link");
const tagLinks = readListing("tags/index.html", "archives-tag-list-link");

// When: the native Reimu taxonomy listings and their links are inspected.
for (const link of [...categoryLinks, ...tagLinks]) {
  assert.ok(link.href, `taxonomy link for ${link.text} has no href`);
  assert.ok(existsSync(targetPath(link.href)), `taxonomy target is missing: ${link.href}`);
}

// Then: all required blog sections are linked to their generated category routes.
for (const [category, expectedRoute] of requiredCategoryRoutes) {
  const link = categoryLinks.find((candidate) => candidate.text === category);
  assert.ok(link, `category listing is missing ${category}`);
  assert.equal(decodeURIComponent(new URL(link.href, siteOrigin).pathname), expectedRoute);

  const categoryHtml = readFileSync(targetPath(link.href), "utf8");
  const postLinks = extractLinks(categoryHtml, "archive-article-title");
  assert.ok(postLinks.length > 0, `category route has no posts: ${expectedRoute}`);
  for (const postLink of postLinks) {
    assert.ok(postLink.href, `post link in ${expectedRoute} has no href`);
    assert.ok(existsSync(targetPath(postLink.href)), `post target is missing: ${postLink.href}`);
  }
}

console.log(
  `Verified ${categoryLinks.length} category links, ${tagLinks.length} tag links, and all required category routes.`,
);
