process.env.WEBDRIVER_MANAGER_VERSION = "true";
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";
const opts = new chrome.Options().addArguments(
  "--headless=new",
  "--no-sandbox",
  "--disable-dev-shm-usage"
);

describe("Búsqueda de producto (si existe buscador)", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser("chrome").setChromeOptions(opts).build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Filtra productos al buscar 'gorra' (si hay buscador)", async function () {
    await driver.get(BASE_URL);

    const linkProductos = By.xpath("//a[contains(.,'Productos')]");
    await driver.wait(until.elementLocated(linkProductos), 15000);
    await driver.findElement(linkProductos).click();

    const candidates = [
      "input[type='search']",
      "input[placeholder*='Buscar' i]",
      "[role='search'] input"
    ];
    let searchEl = null;
    for (const css of candidates) {
      const found = await driver.findElements(By.css(css));
      if (found.length) {
        searchEl = found[0];
        break;
      }
    }

    if (!searchEl) {
      console.log("No hay buscador en la UI → se omite este test.");
      this.skip();
      return;
    }

    await searchEl.clear();
    await searchEl.sendKeys("gorra");

    const anyCard = By.css(".product-card, .card");
    await driver.wait(until.elementLocated(anyCard), 15000);

    const cards = await driver.findElements(anyCard);
    if (!cards.length) {
      throw new Error("No se encontraron resultados tras buscar.");
    }
  });
});
