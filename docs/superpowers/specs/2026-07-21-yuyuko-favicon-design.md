# Yuyuko favicon design

## Goal

Replace Reimu's default pixel-eye browser favicon with the user-supplied pixel-art Yuyuko image for local preview, while leaving every other site icon unchanged.

## Source and treatment

- Source: `C:/Users/damin/Downloads/ChatGPT Image 2026年7月21日 01_37_33.png`, accessed locally through `/mnt/c/Users/damin/Downloads/ChatGPT Image 2026年7月21日 01_37_33.png`.
- Source dimensions: 1254×1254 PNG.
- Treatment: preserve the complete square artwork with no crop, redraw, or generative modification.
- Output: one local favicon `.ico` containing standard browser sizes 16×16, 32×32, and 48×48.

## Integration

- Store the generated favicon in the site's `source/images/` directory.
- Update only the existing Reimu `favicon` configuration to the local generated file.
- Preserve the current banner, avatar, article cover, 404 art, footer icon, back-to-top icon, cursor assets, and loader unchanged.
- Keep the site local-only: no deployment configuration, workflow, remote image hotlink, or publishing action is added.

## Acceptance checks

- The generated `.ico` decodes and includes 16×16, 32×32, and 48×48 entries.
- Generated HTML references the new local favicon path and no longer references Reimu's default favicon.
- The local preview loads the new favicon resource successfully.
- Existing automated site tests continue to pass under Node.js 22.
