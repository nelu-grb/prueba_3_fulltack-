// tests/e2e/driver.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// ▶️ Driver de escritorio
async function buildDesktopDriver() {
  const options = new chrome.Options().addArguments(
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=1366,900"
  );
  // Sin ServiceBuilder ni chromedriver: Selenium Manager elige el binario correcto
  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

// ▶️ Driver “móvil” (para probar el Offcanvas)
async function buildMobileDriver() {
  const options = new chrome.Options().addArguments(
    "--headless=new",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--window-size=390,844" // iPhone 12 aprox
  );
  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}

// ▶️ Helpers por driver
function helpers(driver) {
  const waitVisible = async (locator, ms = 20000) => {
    const el = await driver.wait(until.elementLocated(locator), ms);
    await driver.wait(until.elementIsVisible(el), ms);
    return el;
  };

  const waitGone = async (locator, ms = 20000) => {
    await driver.wait(async () => {
      const els = await driver.findElements(locator);
      if (els.length === 0) return true;
      const displayed = await els[0].isDisplayed().catch(() => false);
      return !displayed;
    }, ms);
  };

  const clickSafe = async (locator) => {
    const el = await waitVisible(locator);
    await waitGone(By.id("loading")).catch(() => {});
    await driver.executeScript(
      "arguments[0].scrollIntoView({block:'center'});",
      el
    );
    try {
      await el.click();
    } catch {
      await driver.executeScript("arguments[0].click();", el);
    }
  };

  const waitUrlContains = async (frag, ms = 20000) => {
    await driver.wait(
      async () => (await driver.getCurrentUrl()).includes(frag),
      ms
    );
  };

  return { By, until, waitVisible, waitGone, clickSafe, waitUrlContains };
}

module.exports = { buildDesktopDriver, buildMobileDriver, helpers };
