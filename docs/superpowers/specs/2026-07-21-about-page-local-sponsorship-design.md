# About-page local sponsorship design

## Goal

Show the supplied WeChat payment QR code only on the About page, using Reimu's native sponsorship component. Keep the personal payment image local-only and out of Git history.

## Scope

- Keep `sponsor.enable: false` globally, so posts and other pages do not display a sponsorship entry.
- Set `sponsor: true` only in `source/about/index.md` front matter.
- Stage the supplied QR image as `source/sponsor/wechat-payment.jpg` for local preview only.
- Add `source/sponsor/wechat-payment.jpg` to `.gitignore`; it must never be committed or published without a deliberate replacement and review.
- Configure a single QR entry named `微信支付` at `/sponsor/wechat-payment.jpg`.
- Use the previously selected C “双樱相映” mark as the sponsorship icon, without rotation.
- Preserve the native interaction: the About-page sponsorship button reveals the QR code on click.

## Out of scope

- No payment processing, accounts, order tracking, webhook, analytics, or payment verification.
- No sponsor display on posts, archive pages, or the home page.
- No remote, GitHub Pages, Actions, or public deployment changes.
- The favicon remains outside this work because it is maintained in another conversation.

## Asset and privacy boundary

The supplied image is a personal WeChat payment QR code. The implementation may copy it into the ignored local path for the running preview, but must not add it to Git. Before any public deployment, replace it with a deliberately publishable QR code or remove the sponsorship configuration.

## Verification

- The About-page generated HTML includes the sponsorship control and `/sponsor/wechat-payment.jpg`.
- A generated post and the home page do not include sponsorship markup or the QR path.
- The QR image decodes locally and remains ignored by Git.
- Existing local preview remains local-only; deployment configuration remains disabled.
