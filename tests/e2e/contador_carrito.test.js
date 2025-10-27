const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Badge del carrito en header", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Aumenta al añadir un producto", async () => {
    await driver.get(`${BASE_URL}/inventario`);

    const badge = await h.waitVisible(h.By.id("cart-count-desktop"));
    const before = parseInt(await badge.getText(), 10) || 0;

    // Sube cantidad y añade
    const plusBtn = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[.//i[contains(@class,'fa-plus')]]");
    const addBtn  = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[contains(.,'Añadir') or contains(.,'Agregar')]");
    await h.clickSafe(plusBtn);
    await h.clickSafe(addBtn);

    // Relee badge
    const badge2 = await h.waitVisible(h.By.id("cart-count-desktop"));
    const after = parseInt(await badge2.getText(), 10) || 0;

    if (!(after > before)) {
      throw new Error(`Esperaba after(${after}) > before(${before})`);
    }
  });
});
