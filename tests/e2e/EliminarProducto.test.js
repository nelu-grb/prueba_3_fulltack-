const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Eliminar producto del carrito", function () {
  this.timeout(60000);
  let driver;

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Elimina correctamente un producto del carrito", async () => {
    await driver.get(BASE_URL);
    const linkProductos = By.xpath("//a[contains(.,'Productos')]");
    await driver.wait(until.elementLocated(linkProductos), 15000);
    await driver.findElement(linkProductos).click();

    const btnAgregar = By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]");
    await driver.wait(until.elementLocated(btnAgregar), 15000);
    await driver.findElement(btnAgregar).click();
    await driver.sleep(1000);

    const linkCarrito = By.xpath("//a[contains(.,'Mi carrito') or contains(.,'carrito')]");
    await driver.wait(until.elementLocated(linkCarrito), 15000);
    await driver.findElement(linkCarrito).click();

    const deleteButton = By.xpath("(//button[.//i[contains(@class,'fa-times')]])[1]");
    await driver.wait(until.elementLocated(deleteButton), 15000);
    const before = await driver.findElements(deleteButton);
    await driver.findElement(deleteButton).click();
    await driver.sleep(800);
    const after = await driver.findElements(deleteButton);

    if (before.length === 1) {
      const vacio = await driver.findElements(By.xpath("//*[contains(.,'No hay productos en el carrito')]"));
      if (vacio.length === 0) throw new Error("El carrito no quedó vacío después de eliminar el único producto");
    } else if (after.length !== before.length - 1) {
      throw new Error("No se eliminó el producto correctamente");
    }
  });
});
