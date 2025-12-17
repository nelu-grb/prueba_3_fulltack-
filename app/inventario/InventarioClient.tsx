"use client";

import React, { useEffect, useState } from "react";
import { Col, Card, Button, Alert, Dropdown } from "react-bootstrap";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";

const API_BASE_URL =
  "https://kittypatitasuaves-inventario.onrender.com";
const API_URL = `${API_BASE_URL}/inventario/productos`;

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  imagen?: string;
}

const OFERTAS: Record<number, number> = {
  1: 15,
  2: 10,
  5: 20,
};

const IMAGE_BY_ID: Record<number, string> = {
  1: "img/pelotaperro.jpg",
  2: "img/raton.jpeg",
  3: "img/morder.jpg",
  4: "img/juguetepuzzleparaperros.webp",
  5: "img/pelota.jpg",
  6: "img/collar.webp",
  7: "img/accesorio.jpg",
  8: "img/collarcorrea.jpg",
  9: "img/cama.webp",
  10: "img/master.jpeg",
  11: "img/lata.jpg",
  12: "img/snackperro.png",
  13: "img/sanac.jpg",
  14: "img/aveees.png",
};

const getOfertaFor = (id: number): number | null =>
  OFERTAS[id] ? OFERTAS[id] : null;

const getImageSrc = (p: Producto) => {
  const ruta = IMAGE_BY_ID[p.id] ?? p.imagen;
  if (!ruta) return "/placeholder.png";
  return ruta.startsWith("/") ? ruta : `/${ruta}`;
};

const InventarioClient: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoriaQuery = searchParams.get("categoria") ?? undefined;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [titulo, setTitulo] = useState("Todos los Productos");
  const [mensaje, setMensaje] = useState<{
    texto: string;
    tipo: string;
  } | null>(null);
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState<{
    [key: number]: number;
  }>({});
  const [stockActual, setStockActual] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Respuesta inválida del servidor: " + res.status);
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("La respuesta no es un array JSON.");
        }
        setProductos(data);
        const initialStock: { [key: number]: number } = {};
        data.forEach((p: Producto) => {
          initialStock[p.id] = p.stock ?? 0;
        });
        setStockActual(initialStock);
      } catch (err: any) {
        setError(err.message ?? "Error desconocido al cargar productos.");
        setMensaje({
          texto: "No se pudo cargar el inventario.",
          tipo: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  useEffect(() => {
    let lista = productos;
    if (categoriaQuery) {
      lista = productos.filter(
        (p) =>
          (p.categoria ?? "").toLowerCase() === categoriaQuery.toLowerCase()
      );
      setTitulo(
        categoriaQuery.charAt(0).toUpperCase() + categoriaQuery.slice(1)
      );
    } else {
      setTitulo("Todos los Productos");
    }
    setProductosFiltrados(lista);
  }, [categoriaQuery, productos]);

  const handleSetCantidad = (id: number, cantidad: number) => {
    const maxStock = stockActual[id] ?? 0;
    const nuevaCantidad = Math.max(0, Math.min(cantidad, maxStock));
    setCantidadesSeleccionadas((prev) => ({ ...prev, [id]: nuevaCantidad }));
  };

  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    if (cantidad === 0) {
      setMensaje({
        texto: `Selecciona al menos 1 unidad de ${producto.nombre}.`,
        tipo: "danger",
      });
      setTimeout(() => setMensaje(null), 2500);
      return;
    }

    const currentStock = stockActual[producto.id] ?? 0;
    if (cantidad > currentStock) {
      setMensaje({
        texto: `Solo quedan ${currentStock} unidades disponibles.`,
        tipo: "danger",
      });
      setTimeout(() => setMensaje(null), 2500);
      return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const idx = carrito.findIndex((i: any) => i.id === producto.id);
    if (idx > -1) carrito[idx].cantidad += cantidad;
    else carrito.push({ id: producto.id, cantidad });

    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new CustomEvent("carritoActualizado"));

    setStockActual((prev) => ({
      ...prev,
      [producto.id]: prev[producto.id] - cantidad,
    }));
    setCantidadesSeleccionadas((prev) => ({ ...prev, [producto.id]: 0 }));

    setMensaje({
      texto: `Se añadieron ${cantidad} unidades de "${producto.nombre}" al carrito.`,
      tipo: "success",
    });
    setTimeout(() => setMensaje(null), 2500);
  };

  const cambiarCategoria = (key: string | null) => {
    if (!key || key === "todos") router.push("/inventario");
    else router.push(`/inventario?categoria=${key}`);
  };

  if (loading) return <div style={{ padding: 24 }}>Cargando inventario…</div>;
  if (error)
    return (
      <Alert variant="danger" className="m-4">
        Error: {error}
      </Alert>
    );

  return (
    <main className="container my-5 flex-grow-1">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap">
        <h2 className="m-0 text-primary fw-bold">{titulo}</h2>

        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold text-muted small">
            Filtrar por Categoria:
          </span>
          <Dropdown align="end" onSelect={cambiarCategoria}>
            <Dropdown.Toggle
              variant="light"
              className="border-0 shadow-sm py-1 px-2 rounded-3"
            >
              <i className="fas fa-ellipsis-v"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="todos" active={!categoriaQuery}>
                Todos
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="juguetes"
                active={categoriaQuery === "juguetes"}
              >
                Juguetes
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="accesorios"
                active={categoriaQuery === "accesorios"}
              >
                Accesorios
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="alimentos"
                active={categoriaQuery === "alimentos"}
              >
                Alimentos
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {mensaje && (
        <Alert variant={mensaje.tipo} className="mt-3 text-center">
          {mensaje.texto}
        </Alert>
      )}

      {productosFiltrados.length === 0 ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <div id="contenedorInventario" className="row g-4">
          {productosFiltrados.map((producto) => {
            const stock = stockActual[producto.id] ?? 0;
            const cantidad = cantidadesSeleccionadas[producto.id] ?? 0;
            const off = getOfertaFor(producto.id);
            const precioConOferta =
              off != null
                ? Math.round(producto.precio - producto.precio * (off / 100))
                : null;
            const esBajoStock = stock > 0 && stock < 3;

            return (
              <Col xs={12} sm={6} md={4} lg={3} key={producto.id}>
                <Card className="h-100 shadow-sm border-0 rounded-4 d-flex flex-column">
                  <Link
                    href={`/detalle/${producto.id}`}
                    className="text-decoration-none text-dark position-relative"
                  >
                    {off != null && (
                      <span className="position-absolute top-0 start-0 m-2 badge bg-danger">
                        -{off}%
                      </span>
                    )}
                    <Card.Img
                      variant="top"
                      src={getImageSrc(producto)}
                      alt={producto.nombre}
                      className="card-img-top"
                    />
                    <Card.Body className="d-flex flex-column pb-0">
                      <Card.Title className="fs-6 fw-semibold text-primary">
                        {producto.nombre}
                      </Card.Title>

                      {precioConOferta != null ? (
                        <div className="d-flex align-items-baseline gap-2">
                          <span className="text-muted text-decoration-line-through">
                            ${producto.precio.toLocaleString("es-CL")}
                          </span>
                          <span className="fw-bold text-success fs-6">
                            ${precioConOferta.toLocaleString("es-CL")}
                          </span>
                        </div>
                      ) : (
                        <Card.Text className="fw-bold text-dark fs-6 mt-1">
                          Precio: ${producto.precio.toLocaleString("es-CL")}
                        </Card.Text>
                      )}

                      <Card.Text className="text-muted mb-1">
                        Stock:{" "}
                        <span className="fw-bold text-info">{stock}</span>
                      </Card.Text>

                      {esBajoStock && (
                        <p className="text-warning fw-semibold mb-3">
                          ⚠️ Queda poco stock
                        </p>
                      )}
                    </Card.Body>
                  </Link>

                  <div className="p-3 pt-0 mt-auto w-100">
                    <div className="d-flex gap-2 align-items-center justify-content-center mb-3">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-pill"
                        onClick={() =>
                          handleSetCantidad(producto.id, cantidad - 1)
                        }
                        disabled={cantidad === 0}
                      >
                        <i className="fas fa-minus"></i>
                      </Button>
                      <span className="fw-bold fs-6 text-dark px-2">
                        {cantidad}
                      </span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill"
                        onClick={() =>
                          handleSetCantidad(producto.id, cantidad + 1)
                        }
                        disabled={cantidad >= stock || stock === 0}
                      >
                        <i className="fas fa-plus"></i>
                      </Button>
                    </div>

                    <Button
                      variant="primary"
                      className="w-100 btn-sm"
                      onClick={() => agregarAlCarrito(producto, cantidad)}
                      disabled={cantidad === 0}
                    >
                      Añadir
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default InventarioClient;
