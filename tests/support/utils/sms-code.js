function getSmsCode(date = new Date()) {
  let month = date.getMonth() + 1;
  month = month < 10 ? `0${month}` : month;
  const year = date.getFullYear();
  return `${String(year).slice(2)}${month}1`;
}

module.exports = { getSmsCode };
