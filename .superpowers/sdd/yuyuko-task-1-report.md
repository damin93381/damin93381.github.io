# Task 1 — Yuyuko local-preview provenance report

## Completed artifacts

- Added `docs/assets/yuyuko-local-preview-sources.md`, covering every enabled
  output filename, exact selected source page, attribution, local purpose, and
  the required publication boundary: `公开发布前需取得许可或替换`.
- Added the ignored local staging path
  `assets/yuyuko-local-preview-source/` to `.gitignore`.
- Added `assets/yuyuko-local-preview-source/README.md` with the four exact
  staging names and image-type validation command.
- Added `test/verify-yuyuko-local-preview-assets.mjs`.

## Provenance check

1. Red: the required test was created and run before the manifest. The default
   `node` is `v12.22.9`, below the project-declared `>=20.19.0`, and therefore
   fails first with `ERR_UNKNOWN_BUILTIN_MODULE` for `node:assert/strict`.
2. Red with a compliant local runtime:
   `/home/drm/.nvm/versions/node/v22.22.2/bin/node test/verify-yuyuko-local-preview-assets.mjs`
   failed with `ENOENT` for the intentionally absent manifest.
3. Green: the same Node 22 command passes after the manifest was added.

The test is intentionally retained exactly as specified. Use Node 20.19 or
newer (Node 22 was available locally) rather than the system Node 12 runtime.

## Selected-source download attempts

No original was staged. This preserves the staging contract: no HTML, XML, or
challenge response was saved under a `*-original` filename, and no alternate
image was substituted.

| Staging path | Selected source page / requested image | Result | Status |
| --- | --- | --- | --- |
| `banner-original` | `https://www.pixiv.net/en/artworks/127200026` | Automated browser retrieval returned `URL ... cannot be opened (non-retryable error)`. | Blocked; no file written. |
| `avatar-original` | `https://thwiki.cc/index.php?setlang=zh&title=%E6%96%87%E4%BB%B6%3A%E8%A5%BF%E8%A1%8C%E5%AF%BA%E5%B9%BD%E5%B9%BD%E5%AD%90%EF%BC%88%E7%BB%AF%E6%83%B3%E5%A4%A9%E7%AB%8B%E7%BB%98%EF%BC%89.png` | Automated browser retrieval failed with `(468) Unknown Status Code`. | Blocked; no file written. |
| `cover-original` | Atwiki source page and its selected image endpoint `https://img.atwiki.jp/genlip/attach/132/782/%E5%B9%BD%E3%80%85%E5%AD%90%E6%83%B3%E8%B5%B7-min.jpg` | The source page was readable, but image retrieval failed with `TimeoutError`. | Blocked; no file written. |
| `404-original` | Konachan source page and its selected PNG endpoint `https://konachan.net/image/8dc6833c85e975e2a21246c50f824a53/Konachan.com%20-%20358002%20butterfly%20cherry_blossoms%20dress%20flowers%20hat%20japanese_clothes%20petals%20pink_eyes%20pink_hair%20saigyouji_yuyuko%20short_hair%20touhou%20umbrella.png` | The source page was readable, but image retrieval failed with `TimeoutError`. | Blocked; no file written. |

Because no eligible image download completed, `file
assets/yuyuko-local-preview-source/*-original` has no files to inspect. The
README retains the required validation command for a user-performed browser
download. The existing preview server on port 4000 was not stopped or changed.

## User-provided staging evidence (2026-07-20)

The user subsequently provided the four selected originals on the local
Desktop. Exact byte-for-byte copies were staged without filename extensions;
the Desktop sources were not modified and the ignored originals were not added
to Git.

| Staging filename | Source file | `file` identification | SHA-256 |
| --- | --- | --- | --- |
| `banner-original` | `127200026_p0.jpg` | JPEG, 4808 x 2074 | `a50ba48722f8348d54c9cb990633c91cb1486ba01665d780af0b73d8fff522c5` |
| `avatar-original` | `西行寺幽幽子（绯想天立绘）.png` | PNG, 444 x 480 | `214f09ffc771786dcf62a497c961ec0d41d000c354721b190f3aa139b5a7eab2` |
| `cover-original` | `008.jpg` | JPEG, 1920 x 1080 | `8eb9b9006d6b6870fa16ac019cb6e412648d4ef2947ffcbca3bf8324a585a3b8` |
| `404-original` | `Konachan.com - 358002 butterfly cherry_blossoms dress flowers hat japanese_clothes petals pink_eyes pink_hair saigyouji_yuyuko short_hair touhou umbrella.png` | PNG, 2550 x 1100 | `1c6107d7c8914f85eeba7079a1e5a649a14f346971d3997a536e42337afec667` |

Each staged digest equals its corresponding Desktop source digest.
