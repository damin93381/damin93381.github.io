# Local Yuyuko preview-source staging

This directory is intentionally ignored by Git and is only for untracked,
user-authorized local-preview source downloads. Do not add originals or derived
images here to commits, deploys, or public repositories.

When source access permits a browser download, stage only these exact files:

- `banner-original`
- `avatar-original`
- `cover-original`
- `404-original`

Verify each staged file is an image (not HTML, XML, or a challenge page) with:

```bash
file assets/yuyuko-local-preview-source/*-original
```

See `docs/assets/yuyuko-local-preview-sources.md` for the source pages,
attribution, intended local outputs, and the publication-permission boundary.
