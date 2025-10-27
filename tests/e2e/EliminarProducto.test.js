// tests/e2e/EliminarProducto.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function findOne(driver, xpaths, timeout = 12000) {
  for (const xp of xpaths) {
    try {
      const loc = By.xpath(xp);
      await driver.wait(until.elementLocated(loc), timeout);
      return await driver.findElement(loc);
    } catch {}
  }
  throw new Error("Elemento no encontrado con ninguno de los selectores");
}

describe("Eliminar producto del carrito", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Elimina correctamente un producto del carrito", async function () {
    await driver.get(`${BASE_URL}/inventario`);
    const addBtn = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await driver.wait(until.elementLocated(addBtn), 15000);
    const addEl = await driver.findElement(addBtn);
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", addEl);
    await driver.sleep(300);
    await driver.actions({ bridge: true }).move({ origin: addEl }).click().perform();

    await driver.get(`${BASE_URL}/pago`);
    const deleteEl = await findOne(driver, [
      "(//i[contains(@class,'fa-times')]/ancestor::button)[1]",
      "(//button[contains(@class,'btn-danger')])[1]",
      "(//div[contains(@class,'card-body')]//button)[last()]"
    ], 15000);

    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", deleteEl);
    await driver.sleep(300);
    await driver.actions({ bridge: true }).move({ origin: deleteEl }).click().perform();

    await driver.sleep(700);
    const empty = await driver.findElements(By.xpath("//*[contains(.,'No hay productos en el carrito')]"));
    const stillDelete = await driver.findElements(By.xpath("(//i[contains(@class,'fa-times')]/ancestor::button)[1]"));
    if (empty.length === 0 && stillDelete.length > 0) throw new Error("No se eliminó el producto del carrito");
  });
});
