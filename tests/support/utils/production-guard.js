const { test } = require('@playwright/test');

function skipOnProductionForTags(tags, reason = 'Tests tagged "test" must not run on production') {
  if (Array.isArray(tags) && tags.includes('test')) {
    test.skip(process.env.PW_ENV === 'production', reason);
  }
}

module.exports = { skipOnProductionForTags };
