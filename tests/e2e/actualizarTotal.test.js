// tests/e2e/actualizarTotal.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function addOneUnitFromFirstCard(driver) {
  const addBtn = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
  await driver.wait(until.elementLocated(addBtn), 25000);
  const addEl = await driver.findElement(addBtn);
  const card = await addEl.findElement(By.xpath("ancestor::div[contains(@class,'card')]"));
  const plusBtn = await card.findElement(By.xpath(".//i[contains(@class,'fa-plus')]/ancestor::button"));
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", plusBtn);
  await driver.sleep(300);
  await driver.actions({ bridge: true }).move({ origin: plusBtn }).click().perform();
  await driver.sleep(200);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", addEl);
  await driver.sleep(200);
  await driver.actions({ bridge: true }).move({ origin: addEl }).click().perform();
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
    await addOneUnitFromFirstCard(driver);

    await driver.get(`${BASE_URL}/pago`);
    await driver.sleep(700);
    const totalBtn = By.xpath("//button[contains(.,'Total a pagar')]");
    await driver.wait(until.elementLocated(totalBtn), 25000);
    const readTotal = async () => {
      const txt = await driver.findElement(totalBtn).getText();
      const n = parseInt(txt.replace(/[^\d]/g, ""), 10);
      return Number.isNaN(n) ? 0 : n;
    };
    const total1 = await readTotal();

    await driver.get(`${BASE_URL}/inventario`);
    await driver.sleep(500);
    await addOneUnitFromFirstCard(driver);

    await driver.get(`${BASE_URL}/pago`);
    await driver.sleep(700);
    await driver.wait(until.elementLocated(totalBtn), 25000);
    await driver.wait(async () => {
      const t2 = await readTotal();
      return t2 > total1;
    }, 25000);
  });
});
