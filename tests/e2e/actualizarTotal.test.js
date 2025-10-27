// tests/e2e/actualizarTotal.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Actualización de total al cambiar cantidad", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("El total (o subtotal) cambia al sumar una unidad", async () => {
    await driver.get(BASE_URL);
    const linkProductos = By.xpath("//a[contains(.,'Productos')]");
    await driver.wait(until.elementLocated(linkProductos), 15000);
    await driver.findElement(linkProductos).click();

    const btnAñadir = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await driver.wait(until.elementLocated(btnAñadir), 15000);
    await driver.findElement(btnAñadir).click();

    const linkCarrito = By.xpath("//a[contains(.,'Mi carrito') or contains(.,'carrito')]");
    await driver.wait(until.elementLocated(linkCarrito), 15000);
    await driver.findElement(linkCarrito).click();

    const totalBtn = By.xpath("//button[contains(.,'Total a pagar') or contains(.,'Total')]");
    await driver.wait(until.elementLocated(totalBtn), 15000);
    await driver.wait(until.elementIsVisible(await driver.findElement(totalBtn)), 15000);

    const readTotal = async () => {
      const txt = await driver.findElement(totalBtn).getText();
      const n = parseInt(txt.replace(/[^\d]/g, ""), 10);
      return Number.isNaN(n) ? 0 : n;
    };

    const before = await readTotal();

    const plusBtn = By.xpath("(//button[.//i[contains(@class,'fa-plus')]])[1]");
    await driver.wait(until.elementLocated(plusBtn), 15000);
    await driver.findElement(plusBtn).click();

    await driver.wait(async () => {
      const now = await readTotal();
      return now > before;
    }, 15000);
  });
});
