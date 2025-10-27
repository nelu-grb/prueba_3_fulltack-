const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Eliminar producto del carrito", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Elimina correctamente un producto del carrito", async () => {
    await driver.get(`${BASE_URL}/inventario`);

    // Asegura que se añada al menos 1
    const plusBtn = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[.//i[contains(@class,'fa-plus')]]");
    const addBtn  = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[contains(.,'Añadir') or contains(.,'Agregar')]");
    await h.clickSafe(plusBtn);
    await h.clickSafe(addBtn);

    // Ir a carrito
    await h.clickSafe(h.By.xpath("//a[contains(.,'carrito') or contains(.,'Carrito')]"));
    await h.waitUrlContains("/pago");

    const itemsAntes = await driver.findElements(h.By.css(".carrito-item"));
    if (itemsAntes.length === 0) throw new Error("No hay items en el carrito");

    // Botón eliminar: “Eliminar”, “Quitar” o ícono de trash
    const deleteLocators = [
      h.By.xpath("(//button[contains(.,'Eliminar')])[1]"),
      h.By.xpath("(//button[contains(.,'Quitar')])[1]"),
      h.By.xpath("(//button[.//i[contains(@class,'fa-trash')]])[1]")
    ];
    let deleted = false;
    for (const loc of deleteLocators) {
      const els = await driver.findElements(loc);
      if (els.length) {
        await h.clickSafe(loc);
        deleted = true;
        break;
      }
    }
    if (!deleted) throw new Error("No encontré el botón Eliminar/Quitar");

    // Espera a que baje la cantidad de filas
    await new Promise(r => setTimeout(r, 800));
    const itemsDespues = await driver.findElements(h.By.css(".carrito-item"));
    if (!(itemsDespues.length < itemsAntes.length)) {
      throw new Error("El producto no se eliminó del carrito");
    }
  });
});
