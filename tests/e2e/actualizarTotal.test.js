// tests/e2e/actualizarTotal.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function findOne(driver, xpaths, timeout = 25000) {
  for (const xp of xpaths) {
    try {
      const loc = By.xpath(xp);
      await driver.wait(until.elementLocated(loc), timeout);
      const el = await driver.findElement(loc);
      return el;
    } catch {}
  }
  return null;
}

describe("Actualización de total al cambiar cantidad", function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("El total cambia al modificar cantidad", async function () {
    await driver.get(`${BASE_URL}/inventario`);
    await driver.sleep(500);

    const addBtn = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await driver.wait(until.elementLocated(addBtn), 25000);
    const addEl = await driver.findElement(addBtn);
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", addEl);
    await driver.sleep(400);
    await driver.actions({ bridge: true }).move({ origin: addEl }).click().perform();

    await driver.get(`${BASE_URL}/pago`);
    await driver.sleep(700);

    const totalBtn = By.xpath("//button[contains(.,'Total a pagar')]");
    await driver.wait(until.elementLocated(totalBtn), 25000);

    const readTotal = async () => {
      const txt = await driver.findElement(totalBtn).getText();
      const n = parseInt(txt.replace(/[^\d]/g, ""), 10);
      return Number.isNaN(n) ? 0 : n;
    };

    const before = await readTotal();

    let plusEl = await findOne(driver, [
      "(//button[.//i[contains(@class,'fa-plus')]])[1]",
      "(//i[contains(@class,'fa-plus')]/ancestor::button)[1]"
    ], 12000);

    if (plusEl) {
      await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", plusEl);
      await driver.sleep(400);
      await driver.actions({ bridge: true }).move({ origin: plusEl }).click().perform();
    } else {
      await driver.get(`${BASE_URL}/inventario`);
      await driver.sleep(500);
      await driver.wait(until.elementLocated(addBtn), 25000);
      const addEl2 = await driver.findElement(addBtn);
      await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", addEl2);
      await driver.sleep(400);
      await driver.actions({ bridge: true }).move({ origin: addEl2 }).click().perform();

      await driver.get(`${BASE_URL}/pago`);
      await driver.sleep(700);
    }

    await driver.wait(async () => {
      const now = await readTotal();
      return now > before;
    }, 25000);
  });
});
