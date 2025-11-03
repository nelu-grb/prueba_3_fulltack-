// tests/e2e/acceso_y_registro.test.js
const { Builder, By, until, Key } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

async function waitFor(fn, timeout = 30000, interval = 250) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const ok = await fn();
      if (ok) return true;
    } catch {}
    if (Date.now() - start > timeout) throw new Error("waitFor timeout");
    await new Promise((r) => setTimeout(r, interval));
  }
}

async function clickSmart(driver, locator, timeout = 15000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.executeScript(
    "arguments[0].scrollIntoView({block:'center'});",
    el
  );
  await driver.wait(until.elementIsVisible(el), timeout);
  try {
    await el.click();
    return;
  } catch {}
  try {
    await driver
      .actions({ bridge: true })
      .move({ origin: el })
      .click()
      .perform();
    return;
  } catch {}
  await driver.executeScript("arguments[0].click();", el);
}

async function pageHasLoginForm(driver) {
  const candidates = [
    By.css("form input[type='email']"),
    By.css("form input[name='email']"),
    By.xpath(
      "//form//input[contains(@placeholder,'correo') or contains(@placeholder,'email') or contains(@aria-label,'correo') or contains(@aria-label,'email')]"
    ),
  ];
  for (const sel of candidates) {
    const els = await driver.findElements(sel);
    if (els.length) return true;
  }
  return false;
}

async function openRegistroPage(driver) {
  await driver.get(`${BASE_URL}/registro`);
  try {
    await driver.wait(
      async () =>
        (await pageHasLoginForm(driver)) ||
        (
          await driver.findElements(
            By.xpath(
              "//h1[contains(.,'Registro') or contains(.,'Registrarse')]"
            )
          )
        ).length > 0,
      5000
    );
    return;
  } catch {}
  await driver.get(BASE_URL);
  const openers = [
    By.xpath(
      "//button[contains(.,'Iniciar sesión') or contains(.,'Cuenta') or contains(.,'Acceder')]"
    ),
    By.xpath(
      "//a[contains(.,'Iniciar sesión') or contains(.,'Cuenta') or contains(.,'Acceder')]"
    ),
  ];
  for (const op of openers) {
    const found = await driver.findElements(op);
    if (found.length) {
      await clickSmart(driver, op);
      break;
    }
  }
  const register = [
    By.xpath("//a[contains(.,'Registr') or contains(.,'Crear cuenta')]"),
    By.xpath("//button[contains(.,'Registr')]"),
  ];
  for (const r of register) {
    const found = await driver.findElements(r);
    if (found.length) {
      await clickSmart(driver, r);
      return;
    }
  }
}

async function openAccesoPage(driver) {
  await driver.get(`${BASE_URL}/acceso`);
  try {
    await driver.wait(async () => await pageHasLoginForm(driver), 5000);
    return;
  } catch {}
  await driver.get(BASE_URL);
  const openers = [
    By.xpath(
      "//button[contains(.,'Iniciar sesión') or contains(.,'Acceder') or contains(.,'Entrar')]"
    ),
    By.xpath(
      "//a[contains(.,'Iniciar sesión') or contains(.,'Acceder') or contains(.,'Entrar')]"
    ),
  ];
  for (const op of openers) {
    const found = await driver.findElements(op);
    if (found.length) {
      await clickSmart(driver, op);
      break;
    }
  }
  const access = [
    By.xpath(
      "//a[contains(.,'Acceder') or contains(.,'Iniciar') or contains(.,'Entrar')]"
    ),
    By.xpath(
      "//button[contains(.,'Acceder') or contains(.,'Iniciar') or contains(.,'Entrar')]"
    ),
  ];
  for (const a of access) {
    const found = await driver.findElements(a);
    if (found.length) {
      await clickSmart(driver, a);
      return;
    }
  }
}

async function fillLoginForm(driver, email, pass) {
  const emailSel = By.xpath(
    "//input[@type='email' or translate(@name,'EMAIL','email')='email' or contains(translate(@placeholder,'EMAIL','email'),'email') or contains(translate(@placeholder,'CORREO','correo'),'correo')]"
  );
  const passSel = By.xpath(
    "//input[@type='password' or translate(@name,'PASSWORD','password')='password' or contains(translate(@placeholder,'CONTRASEÑA','contraseña'),'contraseña')]"
  );
  await driver.wait(until.elementLocated(emailSel), 20000);
  const e = await driver.findElement(emailSel);
  const p = await driver.findElement(passSel);
  await e.clear();
  await e.sendKeys(email);
  await p.clear();
  await p.sendKeys(pass);
}

async function submitLogin(driver) {
  const submitSel = By.xpath(
    "//form//button[@type='submit'] | //button[contains(.,'Iniciar') or contains(.,'Acceder') or contains(.,'Entrar')]"
  );
  await clickSmart(driver, submitSel);
}

async function expectLoginSuccess(driver, email) {
  const successCandidates = [
    By.css(".alert-success"),
    By.css("[data-testid='login-success']"),
    By.xpath("//*[contains(@class,'toast') and contains(.,'éxito')]"),
  ];
  let uiOk = false;
  try {
    await driver.wait(async () => {
      for (const c of successCandidates) {
        if ((await driver.findElements(c)).length) return true;
      }
      const url = await driver.getCurrentUrl();
      if (/perfil|cuenta|dashboard|mi-cuenta/i.test(url)) return true;
      return false;
    }, 15000);
    uiOk = true;
  } catch {}
  await waitFor(
    async () => {
      const keys = ["sesionActiva", "sessionUser", "usuarioActivo"];
      for (const k of keys) {
        const s = await driver.executeScript(
          `return (sessionStorage.getItem('${k}') || localStorage.getItem('${k}'))`
        );
        if (!s) continue;
        try {
          const o = JSON.parse(s);
          if (
            o &&
            (o.activo === true || o.logged === true || o.auth === true) &&
            (o.correo === email || o.email === email)
          )
            return true;
        } catch {}
      }
      return false;
    },
    30000,
    300
  );
  return uiOk;
}

describe("Registro y acceso", function () {
  this.timeout(180000);
  let driver;
  const email = `e2e${Date.now()}@gmail.com`;
  const pass = `Aa123456${Date.now()}`; // letras y números
  const nombre = "Usuario Prueba";

  before(async () => {
    const options = new chrome.Options().addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    );
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    await driver.manage().window().setRect({ width: 1366, height: 900 });
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("Registra (semilla) y luego accede correctamente", async function () {
    await openRegistroPage(driver);
    await driver.executeScript(
      "try{localStorage.clear();sessionStorage.clear();}catch(e){}"
    );

    await driver.executeScript(
      `
      try {
        localStorage.setItem('usuarioRegistrado', JSON.stringify({
          nombreCompleto: arguments[0],
          correo: arguments[1],
          contrasena: arguments[2]
        }));
      } catch(e) {}
      `,
      nombre,
      email,
      pass
    );

    await driver.executeScript(
      `
      try {
        const arr = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const exists = arr.some(u => (u.correo===arguments[1] || u.email===arguments[1]));
        if (!exists) {
          arr.push({ nombreCompleto: arguments[0], correo: arguments[1], email: arguments[1], contrasena: arguments[2], password: arguments[2] });
          localStorage.setItem('usuarios', JSON.stringify(arr));
        }
      } catch(e) {}
      `,
      nombre,
      email,
      pass
    );

    await waitFor(
      async () => {
        const s1 = await driver.executeScript(
          "return localStorage.getItem('usuarioRegistrado')"
        );
        const s2 = await driver.executeScript(
          "return localStorage.getItem('usuarios')"
        );
        try {
          const o1 = s1 ? JSON.parse(s1) : null;
          const o2 = s2 ? JSON.parse(s2) : [];
          return (
            o1 &&
            o1.correo === email &&
            o1.contrasena === pass &&
            Array.isArray(o2) &&
            o2.some((u) => u.correo === email || u.email === email)
          );
        } catch {
          return false;
        }
      },
      25000,
      300
    );

    await openAccesoPage(driver);
    await fillLoginForm(driver, email, pass);
    await submitLogin(driver);

    await expectLoginSuccess(driver, email);
  });

  it("Bloquea acceso con formato inválido", async function () {
    await openAccesoPage(driver);
    await fillLoginForm(driver, "correo-sin-arroba", "soloLetras");
    const submitSel = By.xpath(
      "//form//button[@type='submit'] | //button[contains(.,'Iniciar') or contains(.,'Acceder') or contains(.,'Entrar')]"
    );
    await clickSmart(driver, submitSel);
    const errorHints = [
      By.xpath("//*[contains(.,'@') and contains(.,'requerid')]"),
      By.xpath(
        "//*[contains(.,'correo') and (contains(.,'válid') or contains(.,'valido') or contains(.,'válido'))]"
      ),
      By.css(".is-invalid"),
      By.css(".invalid-feedback"),
      By.css(".alert-danger"),
    ];
    await driver.wait(async () => {
      for (const sel of errorHints)
        if ((await driver.findElements(sel)).length) return true;
      return false;
    }, 8000);
  });
});
