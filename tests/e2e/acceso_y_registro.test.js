// tests/e2e/acceso_y_registro.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function clickSmart(driver, el) {
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'});", el);
  await driver.wait(until.elementIsVisible(el), 15000);
  try { await el.click(); return; } catch {}
  try { await driver.actions({ bridge: true }).move({ origin: el }).click().perform(); return; } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

describe("Registro y acceso", function () {
  this.timeout(120000);
  let driver;
  const email = `e2e${Date.now()}@gmail.com`;
  const pass = `P@ssw0rd!${Date.now()}`;
  const nombre = "Usuario Prueba";

  before(async () => {
    const options = new chrome.Options().addArguments("--headless=new","--no-sandbox","--disable-dev-shm-usage");
    driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => { if (driver) await driver.quit(); });

  it("Registra y luego accede correctamente", async function () {
    await driver.get(`${BASE_URL}/registro`);
    await driver.executeScript(
      "localStorage.setItem('usuarioRegistrado', JSON.stringify({ nombreCompleto: arguments[0], correo: arguments[1], contrasena: arguments[2] }));",
      nombre, email, pass
    );
    const savedOk = await driver.wait(async () => {
      const s = await driver.executeScript("return localStorage.getItem('usuarioRegistrado')");
      if (!s) return false;
      try { const o = JSON.parse(s); return o && o.correo === arguments[0]; } catch { return false; }
    }, 15000, "", email);
    if (!savedOk) throw new Error("usuarioRegistrado no fue creado");

    await driver.get(`${BASE_URL}/acceso`);
    const mailInput = (await driver.findElements(By.css("input[type='email']")))[0];
    const passInput = (await driver.findElements(By.css("input[type='password']")))[0];
    await mailInput.clear(); await mailInput.sendKeys(email);
    await passInput.clear(); await passInput.sendKeys(pass);
    const submit =
      (await driver.findElements(By.xpath("//form//button[@type='submit']")))[0] ||
      (await driver.findElements(By.xpath("//button[contains(.,'Iniciar') or contains(.,'Acceder') or contains(.,'Entrar')]")))[0];
    await clickSmart(driver, submit);

    await driver.wait(async () => {
      const s = await driver.executeScript("return sessionStorage.getItem('sesionActiva')");
      if (!s) return false;
      try { const o = JSON.parse(s); return o && o.activo && o.correo === arguments[0]; } catch { return false; }
    }, 20000, "", email);
  });
});
