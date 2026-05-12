# What's New

- Initial repository setup for first push.
- Added repo-level `.gitignore` and configured the Git remote.
- Ported Nightwatch auth popup and active-input VRT scenarios into Playwright.
- Hardened flaky catalog, search, and auth waits during production browser verification.
- Ported auth VRTs for invalid input and save-number flows, and recorded cross-browser timing notes.
- Ported privacy-policy and user-agreement auth modal VRTs and aligned the tests with the visible agreement links in production.
- Ported the 1188 and 1189 auth flows to Playwright, and removed a brittle `networkidle` wait from the live 5697 catalog test.
- Ported the 1190 auth close-outside flow and the 1191/1192 auth code VRTs, including the wrong-code assertion used by TestIT.
- Added the 1195 quick-order auth port under a dedicated quick-order folder and added a production guard for `test`-tagged cases.
- Aligned 1198 with the 1196 quick-order flow before the auth modal and verified Chromium, Firefox, and WebKit.
- Ported 1199 quick-order invalid-code coverage and verified the flow on staging in Chromium, Firefox, and WebKit.
- Ported 1200 quick-order short-code coverage and verified the flow on staging in Chromium, Firefox, and WebKit twice.
- Ported 1225 basket auth VRT to Playwright, verified Chromium/Firefox/WebKit headed, and centralized Firefox geo prompt handling in config.
- Ported 1226 basket auth wrong-code coverage to the current production checkout flow and verified Chromium, Firefox, and WebKit.
- Added 1227 Playwright coverage for the basket auth SMS code empty-state check after requesting SMS.
- Added 1229 Playwright coverage for resending the SMS code from the current basket auth flow.
