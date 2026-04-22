async function dismissOverlays(page) {
  await page.evaluate(() => {
    document.querySelector('#toast-message-cookie')?.remove();
    document.querySelector('#cookie-popup')?.remove();
    document.querySelector('body .location-alert')?.remove();
    document.querySelector('#location-alert')?.remove();
  });
}

module.exports = { dismissOverlays };
