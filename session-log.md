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

## 2026-04-24
- For SMS login flows, waiting for the auth modal to disappear is more stable than waiting for `body .auth-icon`.
- For the search dropdown mock, `fill()` is more reliable than `insertText()` in WebKit.
- For the catalog mock, the real `dermatologiya` requests match the mocked search/cashback URLs and bodies exactly when they fire; some Chromium iterations fail before the request path is reached.
- Masked auth-phone VRTs needed a short settle delay after typing digits before close/reopen checks, and Firefox headed could require a forced click on auth modal controls.

## 2026-04-27
- Ported the privacy-policy and user-agreement auth modal VRTs to Playwright.
- The visible agreement links in production open `/agreement/privacy-policy` and `/agreement/user-agreement` in a popup, and the agreement pages have duplicate `.agreement` nodes so the visible one must be targeted for screenshots.
