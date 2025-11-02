// tests/e2e/mocha.global.js
const { buildDesktopDriver } = require("./driver");

before(async function () {
  this.timeout(60000);
  global.__DRIVER__ = await buildDesktopDriver();
});

after(async function () {
  if (global.__DRIVER__) await global.__DRIVER__.quit();
});
