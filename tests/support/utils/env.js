const envMap = {
  dev: 'https://dev.portal.phrm.tech/',
  dynamic: 'https://phrm-20741.dev.portal.phrm.tech/',
  staging: 'https://staging.portal.phrm.tech/',
  production: 'https://expero.ru/',
};

function getBaseUrl(envName = process.env.PW_ENV) {
  const baseURL = envMap[envName];

  if (!baseURL) {
    throw new Error(`Set PW_ENV to one of: ${Object.keys(envMap).join(', ')}`);
  }

  return baseURL;
}

module.exports = { envMap, getBaseUrl };
