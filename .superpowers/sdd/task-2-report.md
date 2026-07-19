# Task 2 report: research-blog identity

## Changed configuration

- `_config.yml` now identifies the site as `damin93381`, with the requested Chinese title metadata, author, `zh-CN` locale, `Asia/Shanghai` timezone, and local URL.
- `_config.reimu.yml` uses Reimu's list-of-objects menu schema. The requested Font Awesome class names are represented by Reimu's required icon code points: `f015`, `f007`, `f802`, `f02c`, and `f49e`.
- The Reimu subtitle is a direct string (a supported theme form), the avatar uses Reimu's existing `avatar.webp` default resource, and the GitHub social URL is configured.
- Reimu does not have a theme-level author field; its templates consume Hexo's site-level `author`, so `author: damin93381` is correctly located in `_config.yml`.

## Verification

- `PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm run build` passed and generated 17 files.
- `rg -n 'damin93381|计算化学、材料科学与日常记录|github\\.com/damin93381' public/index.html` found all required values in the generated home page.
- The default `node` executable is v12.22.9 and cannot load `fs/promises`; the available Node v22 runtime was used for the successful build.

## Avatar fix and artifact-backed verification

- Corrected `_config.reimu.yml` from the unsupported boolean `avatar: false` to Reimu's bundled default value `avatar: "avatar.webp"`. Reimu 1.12.5 resolves this value from `source/_data/avatar/avatar.webp`; no personal image or template change was introduced.
- Rebuilt with Node v22 and verified generated `public/index.html` contains `/avatar/avatar.webp` and contains no `/avatar/false` reference.
- Verified the configured source resource exists at `source/_data/avatar/avatar.webp` and the generated public resource exists at `public/avatar/avatar.webp`.

Exact commands and results for this correction:

```text
PATH=/home/drm/.local/opt/node-v22.23.1/bin:$PATH npm run build
# PASS: INFO Generated: index.html; INFO 17 files generated in 43 ms

rg -n '/avatar/false' public
# PASS: no matches (exit 1 expected for an absent string)

rg -n '/avatar/avatar\\.webp' public/index.html
# PASS: desktop and mobile sidebar image URLs both resolve to /avatar/avatar.webp

test -f source/_data/avatar/avatar.webp && test -f public/avatar/avatar.webp
# PASS: both source and generated avatar resources exist
```
