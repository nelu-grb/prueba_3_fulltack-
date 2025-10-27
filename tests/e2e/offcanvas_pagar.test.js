const { buildMobileDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Flujo móvil: Offcanvas → IR A PAGAR", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildMobileDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Agrega producto, abre offcanvas y va a /pago", async () => {
    // Agrega producto (así el botón IR A PAGAR no está deshabilitado)
    await driver.get(`${BASE_URL}/inventario`);
    const plusBtn = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[.//i[contains(@class,'fa-plus')]]");
    const addBtn  = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[contains(.,'Añadir') or contains(.,'Agregar')]");
    await h.clickSafe(plusBtn);
    await h.clickSafe(addBtn);

    // Ir a Home para abrir el menú
    await driver.get(BASE_URL);

    // Abre menú hamburguesa
    await h.clickSafe(h.By.css(".menu-hamburguesa"));

    // Click “IR A PAGAR”
    const payBtn = h.By.xpath("//button[contains(.,'IR A PAGAR')]");
    await h.waitVisible(payBtn);
    await h.clickSafe(payBtn);

    // Llega a /pago
    await h.waitUrlContains("/pago");
  });
});
