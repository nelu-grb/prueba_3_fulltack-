const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Flujo carrito - agregar y pagar", function () {
  this.timeout(120000);
  let driver;

  // ---------- Helpers ----------
  const waitVisible = async (locator, ms = 20000) => {
    const el = await driver.wait(until.elementLocated(locator), ms);
    await driver.wait(until.elementIsVisible(el), ms);
    return el;
    };

  const waitGone = async (locator, ms = 20000) => {
    // espera a que el elemento no exista o no sea visible
    await driver.wait(async () => {
      const els = await driver.findElements(locator);
      if (els.length === 0) return true;
      const displayed = await els[0].isDisplayed().catch(() => false);
      return !displayed;
    }, ms);
  };

  const clickSafe = async (locator) => {
    const el = await waitVisible(locator);
    // si hay loader, esperar a que desaparezca
    await waitGone(By.id("loading")).catch(() => {});
    // scroll + click; si falla por overlay, forzar click JS
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
    try {
      await el.click();
    } catch {
      await driver.executeScript("arguments[0].click();", el);
    }
  };

  const waitUrlContains = async (frag, ms = 20000) => {
    await driver.wait(async () => (await driver.getCurrentUrl()).includes(frag), ms);
  };

  // ---------- Setup ----------
  before(async () => {
    const options = new chrome.Options().addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1366,900" // fuerza layout de escritorio
    );
    const service = new chrome.ServiceBuilder(chromedriver.path).build();
    try {
      if (typeof new Builder().setChromeService === "function") {
        driver = await new Builder()
          .forBrowser("chrome")
          .setChromeOptions(options)
          .setChromeService(service)
          .build();
      } else {
        driver = await chrome.Driver.createSession(options, service);
      }
    } catch {
      driver = await chrome.Driver.createSession(options, service);
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  // ---------- Tests ----------
  it("Abre home y navega a Productos", async () => {
    await driver.get(BASE_URL);

    // Espera a que el loader inicial no esté
    await waitGone(By.id("loading")).catch(() => {});

    // Link Productos del header (versión desktop)
    const linkProductos = By.xpath("//nav//a[contains(.,'Productos')]");
    await clickSafe(linkProductos);

    // Confirma navegación y cards
    await waitUrlContains("/inventario");
    const anyCard = By.xpath("(//div[contains(@class,'product-card')])[1]");
    await waitVisible(anyCard);
  });

  it("Agrega el primer producto", async () => {
    // Asegura que estamos en Inventario y hay una card
    await waitUrlContains("/inventario");
    const firstCard = By.xpath("(//div[contains(@class,'product-card')])[1]");
    await waitVisible(firstCard);

    // Dentro de la primera card busca el botón Añadir/Agregar
    const addBtnInFirstCard = By.xpath(
      "(//div[contains(@class,'product-card')])[1]//button[contains(.,'Añadir') or contains(.,'Agregar')]"
    );
    await clickSafe(addBtnInFirstCard);
  });

  it("Va al carrito desde el header y ve la página de pago", async () => {
    const linkCarrito = By.xpath("//nav//a[contains(.,'Mi carrito') or contains(.,'carrito')]");
    await clickSafe(linkCarrito);

    await waitUrlContains("/pago");
    const marcadorPago = By.xpath("//*[contains(.,'Total') or contains(.,'Pagar') or contains(.,'Resumen')]");
    await waitVisible(marcadorPago);
  });
});
