const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Eliminar producto del carrito", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  it("Elimina correctamente un producto del carrito", async () => {
    await driver.get(`${BASE_URL}/inventario`);
    await h.waitVisible(h.By.xpath("//button[contains(.,'Añadir') or contains(.,'Agregar')]"));
    await h.clickSafe(h.By.xpath("(//button[contains(.,'Añadir') or contains(.,'Agregar')])[1]"));

    // Ir al carrito
    await h.clickSafe(h.By.xpath("//a[contains(.,'Mi carrito') or contains(.,'carrito')]"));
    await h.waitUrlContains("/pago");

    // Contar ítems antes de eliminar
    const itemsAntes = await driver.findElements(h.By.css(".carrito-item"));
    const botonEliminar = h.By.xpath("(//button[contains(.,'Eliminar')])[1]");
    await h.clickSafe(botonEliminar);

    await h.waitGone(h.By.css(".carrito-item"));

    const itemsDespues = await driver.findElements(h.By.css(".carrito-item"));
    if (itemsDespues.length >= itemsAntes.length)
      throw new Error("El producto no se eliminó correctamente del carrito");
  });
});
