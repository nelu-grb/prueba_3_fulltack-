const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Validaciones de registro", function () {
  this.timeout(120000);
  let driver;

  before(async () => {
    const options = new chrome.Options().addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    );
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Bloquea registro con campos vacíos o inválidos", async () => {
    await driver.get(`${BASE_URL}/registro`);

    const nombre = await driver.findElement(By.id("nombreCompleto"));
    const correo = await driver.findElement(By.id("correoElectronico"));
    const pass = await driver.findElement(By.id("contrasenaRegistro"));
    const confirmar = await driver.findElement(By.id("confirmarContrasenaRegistro"));
    const boton = await driver.findElement(By.xpath("//button[contains(.,'Registrarse')]"));

    // Introduce datos inválidos
    await nombre.sendKeys("1234");
    await correo.sendKeys("correo_invalido");
    await pass.sendKeys("abc");
    await confirmar.sendKeys("xyz");
    await boton.click();

    // Espera mensaje de error o feedback inválido
    await driver.wait(async () => {
      const invalids = await driver.findElements(By.css(".is-invalid, .alert-danger"));
      return invalids.length > 0;
    }, 10000);
  });
});
