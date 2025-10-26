"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Alert,
  InputGroup,
} from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { todosLosProductos } from "../Data";

// --- Interfaces para tipado ---
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

// Helper para obtener el producto de la data
const getProductDetails = (id: number) => {
  if (!todosLosProductos || typeof todosLosProductos !== "object") {
    return null;
  }

  const allProducts = [
    ...(todosLosProductos.juguetes || []),
    ...(todosLosProductos.accesorios || []),
    ...(todosLosProductos.alimentos || []),
  ];

  const product = allProducts.find((p) => p.id === id);

  if (product) {
    return {
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen,
    };
  }
  return null;
};

// 🎯 Componente Principal
const Pago = () => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [validated, setValidated] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [mostrarTarjeta, setMostrarTarjeta] = useState(true);
  const [stockActual, setStockActual] = useState<{ [key: number]: number }>({});

  // Función de carga de datos para el useEffect
  const loadDataFromStorage = () => {
    if (typeof window === "undefined") return;

    const carritoStored: { id: number; cantidad: number }[] = JSON.parse(
      localStorage.getItem("carrito") || "[]"
    );
    let stockStored = JSON.parse(sessionStorage.getItem("stockActual") || "{}");

    const carritoDetallado: ItemCarrito[] = carritoStored
      .map((item) => {
        const details = getProductDetails(item.id);

        if (!details) {
          console.warn(
            `Producto con ID ${item.id} no encontrado en la data maestra.`
          );
          return null;
        }

        return {
          id: item.id,
          cantidad: item.cantidad,
          nombre: details.nombre,
          precio: details.precio,
          imagen: details.imagen,
          stock: stockStored[item.id] !== undefined ? stockStored[item.id] : 0,
        };
      })
      .filter((item): item is ItemCarrito => item !== null);

    setCarrito(carritoDetallado);
    setStockActual(stockStored);
  };

  // 1. Cargar carrito y stock al montar
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Damos tiempo a la sincronización de localStorage/sessionStorage
    const timer = setTimeout(loadDataFromStorage, 100);

    // Listener para sincronizar si el carrito cambia en OTRA pestaña
    window.addEventListener("storage", loadDataFromStorage);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", loadDataFromStorage);
    };
  }, []);

  useEffect(() => {
    loadDataFromStorage();

    // 👇 escuchamos cambios de carrito y evento personalizado
    window.addEventListener("carritoActualizado", loadDataFromStorage);
    window.addEventListener("storage", loadDataFromStorage);

    return () => {
      window.removeEventListener("carritoActualizado", loadDataFromStorage);
      window.removeEventListener("storage", loadDataFromStorage);
    };
  }, []);

  // 2. Sincronizar carrito y stock en la memoria (ACTUALIZACIÓN DE ALMACENAMIENTO)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const carritoToStore = carrito.map(({ id, cantidad }) => ({
      id,
      cantidad,
    }));
    localStorage.setItem("carrito", JSON.stringify(carritoToStore));

    sessionStorage.setItem("stockActual", JSON.stringify(stockActual));

    // ❌ ELIMINADO: window.dispatchEvent(new Event('storage'));
    // La actualización de almacenamiento ya se maneja de forma segura al inicio.
  }, [carrito, stockActual]);

  // Calcular totales
  const subtotal = carrito.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );
  const total = subtotal;

  // Lógica para el manejo de cantidad
  const handleCantidadChange = (id: number, nuevaCantidad: number) => {
    setCarrito((prevCarrito) => {
      const updatedCarrito = prevCarrito
        .map((item) => {
          if (item.id === id) {
            const currentQuantity = item.cantidad;
            const stock = stockActual[id] || 0;

            const delta = nuevaCantidad - currentQuantity;

            // Eliminar si la cantidad es 0 o menor
            if (nuevaCantidad < 1) {
              handleEliminarItem(id);
              return null;
            }

            if (delta > 0 && stock < delta) {
              setMensaje({
                texto: `Stock insuficiente para añadir más. Quedan ${stock} unidades.`,
                tipo: "danger",
              });
              return item;
            }

            // Actualizar Stock
            setStockActual((prevStock) => ({
              ...prevStock,
              [id]: (prevStock[id] || 0) - delta,
            }));

            return { ...item, cantidad: nuevaCantidad };
          }
          return item;
        })
        .filter(
          (item) => item !== null && (item as ItemCarrito).cantidad > 0
        ) as ItemCarrito[];

      if (updatedCarrito.length === 0) setMensaje(null);

      return updatedCarrito;
    });
  };

  const handleEliminarItem = (id: number) => {
    setCarrito((prevCarrito) => {
      const itemToRemove = prevCarrito.find((item) => item.id === id);
      if (itemToRemove) {
        // Devolver la cantidad al stock
        setStockActual((prevStock) => ({
          ...prevStock,
          [id]: (prevStock[id] || 0) + itemToRemove.cantidad,
        }));
      }
      return prevCarrito.filter((item) => item.id !== id);
    });
  };

  const handleConfirmarPago = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);

    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setMensaje({
        texto:
          "Por favor, completa correctamente todos los campos de pago y envío.",
        tipo: "danger",
      });
      return;
    }

    if (carrito.length === 0) {
      setMensaje({
        texto: "Tu carrito está vacío. Agrega productos para pagar.",
        tipo: "danger",
      });
      return;
    }

    setMensaje({
      texto: `¡Compra exitosa! Total pagado: $${total.toLocaleString(
        "es-CL"
      )}. Gracias por tu compra.`,
      tipo: "success",
    });

    // Limpieza después de la compra
    setCarrito([]);
    localStorage.removeItem("carrito");
    setValidated(false);
  };

  // Renderizado del Item del Carrito
  const renderCartItem = (item: ItemCarrito) => {
    const itemTotal = (item.precio * item.cantidad).toLocaleString("es-CL");
    const isOutOfStock = stockActual[item.id] <= 0;

    return (
      <Card
        key={item.id}
        className="p-2 shadow-sm d-flex flex-row align-items-center justify-content-between"
        style={{ backgroundColor: "#f3e8ff", border: "none" }}
      >
        {/* 1. Imagen y Nombre/Precio por Unidad */}
        <div className="d-flex align-items-center me-auto">
          <img
            src={item.imagen}
            alt={item.nombre}
            style={{
              width: "50px",
              height: "50px",
              objectFit: "contain",
              borderRadius: "5px",
            }}
            className="me-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.jpg";
            }}
          />
          <div>
            <span className="fw-semibold text-primary d-block">
              {item.nombre}
            </span>
            <small className="text-muted">
              ${item.precio.toLocaleString("es-CL")} c/u
            </small>
          </div>
        </div>

        {/* 2. Controles, Total y Botón Eliminar (Alineados a la derecha) */}
        <div className="d-flex align-items-center gap-2">
          {/* Controles de Cantidad (- X +) */}
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

          {/* Precio Total y Botón Eliminar */}
          <span className="fw-bold text-dark ms-3 me-2">${itemTotal}</span>

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
        <Col lg={8}>
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
                    {carrito.map(renderCartItem)}
                  </div>
                )}

                {/* Total a Pagar en UNA SOLA LÍNEA y Centrado */}
                <Button
                  variant="primary"
                  className="w-100 py-3 fw-bold fs-4 text-center"
                  disabled={carrito.length === 0}
                  style={{
                    background: "var(--primary-color)",
                    color: "var(--secondary-color)",
                    border: "none",
                  }}
                >
                  Total a pagar: ${total.toLocaleString("es-CL")}
                </Button>
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
                      <Form.Control
                        type="text"
                        required
                        placeholder="Tu Nombre Completo"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="emailComprador">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        required
                        placeholder="tu@ejemplo.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="telefonoComprador">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        required
                        placeholder="+56 9 1234 5678"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="direccionComprador">
                      <Form.Label>Dirección de Envío</Form.Label>
                      <Form.Control
                        type="text"
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
                    id="tarjetaCredito"
                    label="Tarjeta de Crédito"
                    value="tarjetaCredito"
                    defaultChecked
                    onChange={() => setMostrarTarjeta(true)}
                    required
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="metodoPago"
                    id="transferencia"
                    label="Transferencia Bancaria"
                    value="transferencia"
                    onChange={() => setMostrarTarjeta(false)}
                    required
                  />
                </div>

                <div
                  id="detallesTarjeta"
                  className={mostrarTarjeta ? "visible" : "oculto"}
                >
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="numeroTarjeta">
                        <Form.Label>Número de Tarjeta</Form.Label>
                        <Form.Control
                          type="text"
                          required={mostrarTarjeta}
                          maxLength={19}
                          placeholder="XXXX XXXX XXXX XXXX"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId="fechaVencimiento">
                        <Form.Label>Fecha de Vencimiento</Form.Label>
                        <Form.Control
                          type="text"
                          required={mostrarTarjeta}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId="cvv">
                        <Form.Label>CVV</Form.Label>
                        <Form.Control
                          type="text"
                          required={mostrarTarjeta}
                          maxLength={3}
                          placeholder="XXX"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

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
};

export default Pago;
