"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { todosLosProductos, getOfertaFor } from "../Data";
import { useRouter } from "next/navigation";

interface ItemCarrito {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
}

interface Mensaje {
  texto: string;
  tipo: "success" | "danger";
}

const norm = (src: string) => (src?.startsWith("/") ? src : `/${src}`);

const getProductDetails = (id: number) => {
  const allProducts = [
    ...(todosLosProductos.juguetes || []),
    ...(todosLosProductos.accesorios || []),
    ...(todosLosProductos.alimentos || []),
  ];
  return allProducts.find((p) => p.id === id) || null;
};

export default function Pago() {
  const router = useRouter();
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [validated, setValidated] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [mostrarTarjeta, setMostrarTarjeta] = useState(true);
  const [stockActual, setStockActual] = useState<{ [key: number]: number }>({});

  const loadDataFromStorage = () => {
    const carritoStored = JSON.parse(
      localStorage.getItem("carrito") || "[]"
    ) as { id: number; cantidad: number }[];

    const stockStored = JSON.parse(
      sessionStorage.getItem("stockActual") || "{}"
    ) as Record<number, number>;

    let carritoDetallado: ItemCarrito[] = carritoStored
      .map((item: { id: number; cantidad: number }) => {
        const details = getProductDetails(item.id);
        if (!details) return null;
        return {
          id: item.id,
          cantidad: item.cantidad,
          nombre: details.nombre,
          precio: details.precio,
          imagen: details.imagen,
          stock: (details as any).stock ?? 0,
        } as ItemCarrito | null;
      })
      .filter((x: ItemCarrito | null): x is ItemCarrito => x !== null);

    if (carritoDetallado.length === 0) {
      const pending = JSON.parse(
        sessionStorage.getItem("kp_pending_cart") || "[]"
      ) as ItemCarrito[];
      const pendingStock = JSON.parse(
        sessionStorage.getItem("kp_pending_stock") || "{}"
      ) as Record<number, number>;
      if (Array.isArray(pending) && pending.length > 0) {
        carritoDetallado = pending;
        localStorage.setItem(
          "carrito",
          JSON.stringify(
            pending.map((x: ItemCarrito) => ({
              id: x.id,
              cantidad: x.cantidad,
            }))
          )
        );
        sessionStorage.setItem("stockActual", JSON.stringify(pendingStock));
        sessionStorage.removeItem("kp_pending_cart");
        sessionStorage.removeItem("kp_pending_stock");
        sessionStorage.removeItem("kp_pending_totals");
        sessionStorage.removeItem("kp_pending_reason");
      }
    }

    const inicial: Record<number, number> = { ...stockStored };

    carritoDetallado.forEach((item) => {
      if (inicial[item.id] == null) {
        inicial[item.id] = item.stock;
      }
    });

    setCarrito(carritoDetallado);
    setStockActual(inicial);
  };

  useEffect(() => {
    loadDataFromStorage();
    const handler = () => loadDataFromStorage();
    window.addEventListener("carritoActualizado", handler);
    return () => window.removeEventListener("carritoActualizado", handler);
  }, []);

  useEffect(() => {
    const carritoToStore = carrito.map(({ id, cantidad }: ItemCarrito) => ({
      id,
      cantidad,
    }));
    localStorage.setItem("carrito", JSON.stringify(carritoToStore));
    sessionStorage.setItem("stockActual", JSON.stringify(stockActual));
  }, [carrito, stockActual]);

  const { subtotal, descuento, total, items } = useMemo(() => {
    let sub = 0;
    let desc = 0;
    let it = 0;
    for (const item of carrito) {
      const off = getOfertaFor(item.id) || 0;
      const lineSub = item.precio * item.cantidad;
      sub += lineSub;
      desc += Math.round(lineSub * (off / 100));
      it += item.cantidad;
    }
    return { subtotal: sub, descuento: desc, total: sub - desc, items: it };
  }, [carrito]);

  const handleCantidadChange = (id: number, nuevaCantidad: number) => {
    setCarrito((prev: ItemCarrito[]) =>
      prev
        .map((item: ItemCarrito | null) => {
          if (!item || item.id !== id) return item;

          if (nuevaCantidad < 1) return null;

          const disponibleActual = stockActual[id] ?? item.stock ?? 0;
          const delta = nuevaCantidad - item.cantidad;

          if (delta > 0 && disponibleActual < delta) {
            setMensaje({
              texto: `Stock insuficiente para añadir más. Quedan ${disponibleActual} unidades.`,
              tipo: "danger",
            });
            return item;
          }

          setStockActual((s) => ({
            ...s,
            [id]: disponibleActual - delta,
          }));

          return { ...item, cantidad: nuevaCantidad };
        })
        .filter((x: ItemCarrito | null): x is ItemCarrito => x !== null)
    );
  };

  const handleEliminarItem = (id: number) => {
    setCarrito((prev: ItemCarrito[]) => {
      const it = prev.find((x: ItemCarrito) => x.id === id);
      if (it) {
        const disponibleActual = stockActual[id] ?? it.stock ?? 0;
        setStockActual((s) => ({
          ...s,
          [id]: disponibleActual + it.cantidad,
        }));
      }
      return prev.filter((x: ItemCarrito) => x.id !== id);
    });
  };

  const handleConfirmarPago = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setValidated(true);
    const form = e.currentTarget as HTMLFormElement;

    const nombre =
      (form.querySelector("#nombreComprador") as HTMLInputElement)?.value || "";
    const email =
      (form.querySelector("#emailComprador") as HTMLInputElement)?.value || "";
    const tel =
      (form.querySelector("#telefonoComprador") as HTMLInputElement)?.value ||
      "";
    const direccion =
      (form.querySelector("#direccionComprador") as HTMLInputElement)?.value ||
      "";

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const telOk = /^\+?\d{7,15}$/.test(tel);

    if (!form.checkValidity() || !emailOk || !telOk) {
      sessionStorage.setItem("kp_pending_cart", JSON.stringify(carrito));
      sessionStorage.setItem("kp_pending_stock", JSON.stringify(stockActual));
      sessionStorage.setItem(
        "kp_pending_totals",
        JSON.stringify({ subtotal, descuento, total })
      );
      sessionStorage.setItem(
        "kp_pending_reason",
        "Correo o teléfono inválido. Revisa el formato e inténtalo nuevamente."
      );
      router.push("/pago/PagoRechazado");
      return;
    }

    if (carrito.length === 0) {
      setMensaje({
        texto: "Tu carrito está vacío. Agrega productos para pagar.",
        tipo: "danger",
      });
      return;
    }

    const payload = {
      subtotal,
      descuento,
      total,
      estado: "EXITOSO",
      motivo: null,
      nombreComprador: nombre,
      emailComprador: email,
      telefonoComprador: tel,
      direccionComprador: direccion,
      items: carrito.map((item) => ({
        productoId: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        imagen: item.imagen,
      })),
    };

    try {
      const resp = await fetch(
        "https://pago-kittipatitassuaves3-production.up.railway.app/pagos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      let pagoBackend: any | null = null;
      try {
        if (resp.ok) {
          pagoBackend = await resp.json();
        } else {
          console.error("Error pago:", resp.status, await resp.text());
        }
      } catch {
        pagoBackend = null;
      }

      sessionStorage.setItem(
        "kp_success_order",
        JSON.stringify({
          items: carrito,
          subtotal: pagoBackend?.subtotal ?? subtotal,
          descuento: pagoBackend?.descuento ?? descuento,
          total: pagoBackend?.total ?? total,
          id: pagoBackend?.id ?? null,
          estado: pagoBackend?.estado ?? "EXITOSO",
          fechaHora: pagoBackend?.fechaHora ?? null,
          nombreComprador: nombre,
          emailComprador: email,
          telefonoComprador: tel,
          direccionComprador: direccion,
        })
      );

      try {
        await fetch(
          "https://inventario-kittipatitassuaves3-production.up.railway.app/inventario/ajustar-stock",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              carrito.map((item) => ({
                productoId: item.id,
                cantidad: item.cantidad,
              }))
            ),
          }
        );
      } catch (err) {
        console.error("Error ajustando stock en inventario:", err);
      }
    } catch (err) {
      console.error("Error llamando al microservicio de pago:", err);
      sessionStorage.setItem(
        "kp_success_order",
        JSON.stringify({
          items: carrito,
          subtotal,
          descuento,
          total,
          id: null,
          estado: "EXITOSO",
          fechaHora: null,
          nombreComprador: nombre,
          emailComprador: email,
          telefonoComprador: tel,
          direccionComprador: direccion,
        })
      );
    }

    const totalCL = encodeURIComponent(total.toString());
    const itemsCL = encodeURIComponent(items.toString());
    localStorage.removeItem("carrito");
    window.dispatchEvent(new Event("carritoActualizado"));
    setCarrito([]);
    router.push(`/pago/CompraExitosa?total=${totalCL}&items=${itemsCL}`);
  };

  const renderCartItem = (item: ItemCarrito) => {
    const off = getOfertaFor(item.id) || 0;
    const lineSub = item.precio * item.cantidad;
    const lineDesc = Math.round(lineSub * (off / 100));
    const lineTotal = lineSub - lineDesc;
    const disponibleActual = stockActual[item.id] ?? item.stock ?? 0;
    const isOutOfStock = disponibleActual <= 0;

    return (
      <Card
        key={item.id}
        className="p-2 shadow-sm d-flex flex-row align-items-center justify-content-between"
        style={{ backgroundColor: "#f3e8ff", border: "none" }}
      >
        <div className="d-flex align-items-center me-auto">
          <img
            src={norm(item.imagen)}
            alt={item.nombre}
            style={{
              width: "50px",
              height: "50px",
              objectFit: "contain",
              borderRadius: "5px",
            }}
            className="me-3"
            onError={(e) =>
              ((e.target as HTMLImageElement).src = "/placeholder.jpg")
            }
          />
          <div>
            <span className="fw-semibold text-primary d-block">
              {item.nombre}
            </span>
            {off > 0 ? (
              <>
                <small className="text-muted me-2">
                  ${item.precio.toLocaleString("es-CL")} c/u
                </small>
                <span className="badge bg-danger me-2">-{off}%</span>
                <small className="fw-semibold" style={{ color: "#007f4e" }}>
                  {Math.round(lineTotal / item.cantidad).toLocaleString(
                    "es-CL"
                  )}{" "}
                  c/u
                </small>
              </>
            ) : (
              <small className="text-muted">
                ${item.precio.toLocaleString("es-CL")} c/u
              </small>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-danger"
            onClick={() => handleCantidadChange(item.id, item.cantidad - 1)}
            size="sm"
            className="p-0 border-0"
            style={{ width: "24px", height: "24px" }}
          >
            <i className="fas fa-minus"></i>
          </Button>
          <span
            className="fw-bold fs-5 mx-1"
            style={{ minWidth: "20px", textAlign: "center" }}
          >
            {item.cantidad}
          </span>
          <Button
            variant="outline-primary"
            onClick={() => handleCantidadChange(item.id, item.cantidad + 1)}
            size="sm"
            className="p-0 border-0"
            style={{ width: "24px", height: "24px" }}
            disabled={isOutOfStock}
          >
            <i className="fas fa-plus"></i>
          </Button>
          <span className="fw-bold text-dark ms-3 me-2">
            ${lineTotal.toLocaleString("es-CL")}
          </span>
          <Button
            variant="danger"
            onClick={() => handleEliminarItem(item.id)}
            className="p-0 border-0 rounded-circle"
            style={{
              width: "20px",
              height: "20px",
              lineHeight: 1,
              backgroundColor: "transparent",
              color: "#dc3545",
              fontSize: "1rem",
            }}
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <main className="container my-5 flex-grow-1">
      {mensaje && (
        <Alert variant={mensaje.tipo} className="mb-4 text-center">
          {mensaje.texto}
        </Alert>
      )}
      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <Card className="shadow-lg">
            <div className="card-header bg-primary text-white text-center py-3">
              <h3 className="h4 mb-0">
                <i className="fas fa-shopping-cart me-2"></i>Mi Carrito
              </h3>
            </div>
            <div className="card-body p-4">
              <section id="resumenCompra" className="mb-4">
                <h5 className="mb-3 text-primary">Artículos en tu Carrito</h5>
                {carrito.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    No hay productos en el carrito para pagar.
                  </Alert>
                ) : (
                  <div className="d-grid gap-3 mb-4">
                    {carrito.map((it: ItemCarrito) => renderCartItem(it))}
                  </div>
                )}
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString("es-CL")}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Descuento (ofertas aplicadas)</span>
                      <span className="text-success">
                        - ${descuento.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total</span>
                      <span>${total.toLocaleString("es-CL")}</span>
                    </div>
                  </Card.Body>
                </Card>
              </section>

              <Form
                noValidate
                validated={validated}
                onSubmit={handleConfirmarPago}
              >
                <h5 className="text-primary mt-4 mb-3">
                  Información del Comprador
                </h5>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group controlId="nombreComprador">
                      <Form.Label>Nombre Completo</Form.Label>
                      <Form.Control required placeholder="Tu Nombre Completo" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="emailComprador">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control required placeholder="tu@ejemplo.com" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="telefonoComprador">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control required placeholder="+56 9 1234 5678" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="direccionComprador">
                      <Form.Label>Dirección de Envío</Form.Label>
                      <Form.Control
                        required
                        placeholder="Calle, Número, Ciudad"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="text-primary mb-3">Detalles del Pago</h5>
                <div className="mb-4">
                  <Form.Label className="d-block mb-2">
                    Método de Pago
                  </Form.Label>
                  <Form.Check
                    inline
                    type="radio"
                    name="metodoPago"
                    label="Tarjeta de Crédito"
                    defaultChecked
                    onChange={() => setMostrarTarjeta(true)}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="metodoPago"
                    label="Transferencia Bancaria"
                    onChange={() => setMostrarTarjeta(false)}
                  />
                </div>

                {mostrarTarjeta && (
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="numeroTarjeta">
                        <Form.Label>Número de Tarjeta</Form.Label>
                        <Form.Control
                          required
                          maxLength={19}
                          placeholder="XXXX XXXX XXXX XXXX"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId="fechaVencimiento">
                        <Form.Label>Vencimiento</Form.Label>
                        <Form.Control
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId="cvv">
                        <Form.Label>CVV</Form.Label>
                        <Form.Control
                          required
                          maxLength={3}
                          placeholder="XXX"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Button
                  type="submit"
                  id="btnConfirmarPago"
                  variant="success"
                  size="lg"
                  className="w-100 mt-4"
                  disabled={carrito.length === 0}
                >
                  <i className="fas fa-lock me-2"></i>Confirmar Pago
                </Button>
              </Form>
            </div>
          </Card>
        </Col>
      </Row>
    </main>
  );
}
