# Session Log

## 2026-04-22
- Ported Nightwatch auth popup close tests to Playwright.
- Ported auth modal active-input VRT to Playwright and generated the initial baseline.
- Noted that some portal auth flows need a `Да, я здесь` city-confirm click after dismissing overlays.

## 2026-04-23
- Ported Nightwatch short-number auth VRT to Playwright and generated the baseline.
- The short-number submit button can stay disabled after `00000`, so the legacy click step maps to a forced click in Playwright.
- Fixed `5697` by restoring the legacy portal-first startup flow before opening `catalog/bad`.
- Firefox `1179` needed `domcontentloaded` instead of `load` on the product page.
- Playwright did not reliably cover all browsers from one `--browser` command here; run Chromium, Firefox, and WebKit separately.
