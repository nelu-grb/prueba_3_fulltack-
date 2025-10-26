const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver"); // ← binario correcto (v140)

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Flujo carrito - agregar y pagar", function () {
  this.timeout(90000);
  let driver;

  before(async () => {
    // 🔒 Fuerza a Selenium a usar ESTE chromedriver (no el del sistema)
    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());

    const options = new chrome.Options().addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    );

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Abre home y navega a Productos", async () => {
    await driver.get(BASE_URL);

    const linkProductos = By.xpath("//a[contains(.,'Productos')]");
    await driver.wait(until.elementLocated(linkProductos), 20000);
    await driver.findElement(linkProductos).click();

    const botonAgregar = By.xpath("//button[contains(.,'Añadir') or contains(.,'Agregar')]");
    await driver.wait(until.elementLocated(botonAgregar), 20000);
  });

  it("Agrega el primer producto", async () => {
    const plusBtn = By.xpath("(//button[contains(@class,'outline-primary') and .//i[contains(@class,'fa-plus')]])[1]");
    try { await driver.findElement(plusBtn).click(); } catch {}

    const addBtn = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await driver.findElement(addBtn).click();
  });

  it("Va al carrito desde el header y ve la página de pago", async () => {
    const linkCarrito = By.xpath("//a[contains(.,'Mi carrito') or contains(.,'carrito')]");
    await driver.wait(until.elementLocated(linkCarrito), 20000);
    await driver.findElement(linkCarrito).click();

    const marcadorPago = By.xpath("//*[contains(.,'Total') or contains(.,'Pagar') or contains(.,'Resumen')]");
    await driver.wait(until.elementLocated(marcadorPago), 20000);
  });
});
