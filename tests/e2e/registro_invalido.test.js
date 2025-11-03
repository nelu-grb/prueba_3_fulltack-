// tests/e2e/registro_invalido.test.js
const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function clickSmart(driver, locator, timeout = 15000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await driver.wait(until.elementIsVisible(el), timeout);
  try { await el.click(); return; } catch {}
  try {
    await driver.actions({ bridge: true }).move({ origin: el }).click().perform();
    return;
  } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

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
    // Aumenta viewport para evitar overlays/intercepciones
    await driver.manage().window().setRect({ width: 1366, height: 1200 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Bloquea registro con campos vacíos o inválidos", async () => {
    await driver.get(`${BASE_URL}/registro`);

    const nombre = By.id("nombreCompleto");
    const correo = By.id("correoElectronico");
    const pass = By.id("contrasenaRegistro");
    const confirmar = By.id("confirmarContrasenaRegistro");
    const boton = By.xpath("//button[contains(.,'Registrarse') or @type='submit']");

    // Asegura que el formulario esté cargado
    await driver.wait(until.elementLocated(nombre), 10000);

    // Introduce datos inválidos
    await driver.findElement(nombre).sendKeys("1234");
    await driver.findElement(correo).sendKeys("correo_invalido");
    await driver.findElement(pass).sendKeys("abc");
    await driver.findElement(confirmar).sendKeys("xyz");

    // Scroll extra por si hay sticky footer/cabecera
    await driver.executeScript("window.scrollTo(0, document.body.scrollHeight);");
    await driver.sleep(200); // pequeño respiro

    // Click robusto con fallback a ENTER
    try {
      await clickSmart(driver, boton);
    } catch {
      const last = await driver.findElement(confirmar);
      await last.sendKeys(Key.ENTER);
    }

    // Espera feedback de error (.is-invalid o .alert-danger)
    await driver.wait(async () => {
      const invalids = await driver.findElements(By.css(".is-invalid, .invalid-feedback, .alert-danger"));
      return invalids.length > 0;
    }, 10000);
  });
});
