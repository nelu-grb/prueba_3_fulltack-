const { buildDesktopDriver, helpers } = require("./support/driver");
const BASE_URL = process.env.BASE_URL || "https://prueba-finalmente.vercel.app";

describe("Actualización de total al cambiar cantidad", function () {
  this.timeout(120000);
  let driver, h;

  before(async () => { driver = await buildDesktopDriver(); h = helpers(driver); });
  after(async () => { if (driver) await driver.quit(); });

  // Utilidad: intenta encontrar el elemento Total con varias estrategias
  const findTotalElement = async () => {
    const locators = [
      h.By.xpath("//*[contains(.,'Total')]/following::strong[1]"),
      h.By.xpath("//*[contains(.,'Total')]/following::*[self::strong or self::b or self::span][1]"),
      h.By.css("#total, .total, [data-testid='total']"),
    ];
    for (const loc of locators) {
      const els = await driver.findElements(loc);
      if (els.length) return els[0];
    }
    return null;
  };

  const parseNumber = (txt) => parseFloat((txt || "").replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".")) || 0;

  it("El total (o subtotal) cambia al sumar una unidad", async () => {
    // Prepara un carrito con 1 unidad
    await driver.get(`${BASE_URL}/inventario`);
    // Asegura que la cantidad sea > 0 antes de añadir
    const plusBtn = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[.//i[contains(@class,'fa-plus')]]");
    const addBtn  = h.By.xpath("(//div[contains(@class,'product-card')])[1]//button[contains(.,'Añadir') or contains(.,'Agregar')]");
    await h.clickSafe(plusBtn);
    await h.clickSafe(addBtn);

    // Ir a /pago
    await h.clickSafe(h.By.xpath("//a[contains(.,'carrito') or contains(.,'Carrito')]"));
    await h.waitUrlContains("/pago");

    // Intenta leer TOTAL; si no existe, usa SUBTOTAL de la primera fila
    let baseEl = await findTotalElement();
    if (!baseEl) {
      baseEl = await h.waitVisible(h.By.xpath("(//div[contains(@class,'carrito-item')])[1]//*[contains(@class,'subtotal') or self::strong or self::span][1]"));
    }
    const before = parseNumber(await baseEl.getText());

    // Sumar cantidad en la primera fila
    const plusInRow = h.By.xpath("(//div[contains(@class,'carrito-item')])[1]//button[contains(.,'+') or .//i[contains(@class,'fa-plus')]]");
    await h.clickSafe(plusInRow);

    // Espera pequeño y vuelve a leer
    await new Promise(r => setTimeout(r, 1000));
    const after = parseNumber(await baseEl.getText());

    if (!(after > before)) {
      throw new Error(`El importe no cambió tras aumentar cantidad (${before} → ${after})`);
    }
  });
});
