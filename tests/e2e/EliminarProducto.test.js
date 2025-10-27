const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

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
    const el = await driver.findElement(addBtn);
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
    await driver.sleep(500);
    await driver.actions({ bridge: true }).move({ origin: el }).click().perform();

    await driver.get(`${BASE_URL}/pago`);
    const deleteBtn = By.xpath("(//button[.//i[contains(@class,'fa-times')]])[1]");
    await driver.wait(until.elementLocated(deleteBtn), 15000);
    const delEl = await driver.findElement(deleteBtn);
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", delEl);
    await driver.sleep(500);
    await driver.actions({ bridge: true }).move({ origin: delEl }).click().perform();

    const emptyAlert = await driver.findElements(By.xpath("//*[contains(.,'No hay productos en el carrito')]"));
    if (emptyAlert.length === 0) throw new Error("El carrito no quedó vacío tras eliminar el producto");
  });
});
