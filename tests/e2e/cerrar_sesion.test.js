
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Cierre de sesión", function () {
  this.timeout(120000);
  let driver;

  const email = `logout${Date.now()}@gmail.com`;
  const pass = `Aa123456${Date.now()}`;
  const nombre = "Tester Logout";

  before(async () => {
    const options = new chrome.Options().addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    );
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();

    await driver.manage().window().setRect({ width: 1366, height: 900 });

    // Semilla previa (usuario registrado)
    await driver.get(BASE_URL);
    await driver.executeScript(
      `
      localStorage.setItem('usuarioRegistrado', JSON.stringify({
        nombreCompleto: arguments[0],
        correo: arguments[1],
        contrasena: arguments[2]
      }));
      sessionStorage.clear();
      `,
      nombre,
      email,
      pass
    );
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Inicia y luego cierra sesión correctamente", async () => {
    await driver.get(`${BASE_URL}/acceso`);

    const emailInput = By.css("input[type='email']");
    const passInput = By.css("input[type='password']");
    const submitBtn = By.xpath("//button[contains(.,'Iniciar') or contains(.,'Acceder')]");

    await driver.wait(until.elementLocated(emailInput), 10000);
    await driver.findElement(emailInput).sendKeys(email);
    await driver.findElement(passInput).sendKeys(pass);
    await driver.findElement(submitBtn).click();

    // Espera a que se cree la sesión
    await driver.wait(async () => {
      const s = await driver.executeScript("return sessionStorage.getItem('sesionActiva')");
      return s && s.includes(email);
    }, 15000);

    // Simula click en botón "Cerrar sesión"
    await driver.executeScript(`
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('sesionActiva');
      window.dispatchEvent(new Event('authChanged'));
    `);

    // Valida limpieza
    const stillLogged = await driver.executeScript(
      "return sessionStorage.getItem('sesionActiva') || localStorage.getItem('isLoggedIn');"
    );
    if (stillLogged) throw new Error("No se limpió la sesión correctamente");
  });
});
