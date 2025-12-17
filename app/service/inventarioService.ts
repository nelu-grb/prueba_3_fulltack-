export async function getProductos() {
  try {
    const res = await fetch("https://kittypatitasuaves3-fin.onrender.com/inventario/productos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Error al obtener productos");

    return await res.json();
  } catch (error) {
    console.error("Error en getProductos:", error);
    return [];
  }
}
