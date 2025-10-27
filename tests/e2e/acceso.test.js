// tests/e2e/acceso_success.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function setUser(driver, correo, contrasena, nombre) {
  const user = { nombreCompleto: nombre, correo, contrasena, mascotas: [] };
  await driver.executeScript(`localStorage.setItem('usuarioRegistrado', JSON.stringify(${JSON.stringify(user)}));`);
}

async function typeInto(driver, locator, text) {
  await driver.wait(until.elementLocated(locator), 25000);
  const el = await driver.findElement(locator);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await el.clear();
  await el.sendKeys(text);
  return el;
}

describe("Acceso correcto", function () {
  this.timeout(90000);
  let driver;
  const email = `login${Date.now()}@gmail.com`;
  const pass = `P@ssw0rd!${Date.now()}`;
  const nombre = "Login Ok";

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Inicia sesión y activa la sesión en storage", async function () {
    await driver.get(`${BASE_URL}/`);
    await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
    await setUser(driver, email, pass, nombre);

    await driver.get(`${BASE_URL}/acceso`);
    await driver.sleep(600);

    const emailById = By.id("correoAcceso");
    const emailByType = By.css("input[type='email']");
    let emailEl;
    try { emailEl = await typeInto(driver, emailById, email); }
    catch { emailEl = await typeInto(driver, emailByType, email); }

    const passById = By.id("contrasenaAcceso");
    const passByType = By.css("input[type='password']");
    try { await typeInto(driver, passById, pass); }
    catch { await typeInto(driver, passByType, pass); }

    let submit;
    const candidates = [
      "//button[contains(.,'Iniciar Sesión')]",
      "//button[contains(.,'Acceder')]",
      "//form//button[@type='submit']",
      "//form//button"
    ];
    for (const xp of candidates) {
      const found = await driver.findElements(By.xpath(xp));
      if (found.length) { submit = found[0]; break; }
    }
    if (!submit) throw new Error("No se encontró botón de envío");
    await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", submit);
    await driver.sleep(200);
    await driver.actions({ bridge: true }).move({ origin: submit }).click().perform();

    await driver.sleep(800);

    const sess = await driver.executeScript("return sessionStorage.getItem('sesionActiva') || '';");
    if (!sess) throw new Error("No se creó sesionActiva");
    const obj = JSON.parse(sess);
    if (!obj.activo || obj.correo !== email) throw new Error("Sesión inválida");
  });
});
