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
