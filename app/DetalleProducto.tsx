import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";
import { todosLosProductos, Producto } from "../app/Data";
import { useRouter } from "next/router";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";

const DetalleProducto: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const productId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const buscarProductoPorId = (id: number): Producto | undefined => {
    const todos = [
      ...todosLosProductos.juguetes,
      ...todosLosProductos.accesorios,
      ...todosLosProductos.alimentos,
    ];
    return todos.find((p) => p.id === id);
  };

  useEffect(() => {
    setCargando(true);
    if (productId !== undefined && !isNaN(productId)) {
      const prod = buscarProductoPorId(productId);
      setProducto(prod || null);
    }
    setCargando(false);
  }, [productId]);

  const handleAgregarACarrito = () => {
    if (!producto || cantidad > producto.stock || cantidad <= 0) {
      setMensaje("Error: Cantidad inválida o superior al stock.");
      return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    const itemExistente = carrito.find((item: any) => item.id === producto.id);

    if (itemExistente) {
      itemExistente.cantidad += cantidad;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad,
        stock: producto.stock,
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    setMensaje(
      `Se agregaron ${cantidad} unidades de "${producto.nombre}" al carrito.`
    );
    setTimeout(() => setMensaje(null), 3000);
  };

  if (cargando) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2">Cargando detalle del producto...</p>
      </Container>
    );
  }

  if (!producto) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger" className="fs-4">
          Producto no encontrado.
        </Alert>
        <Link href="/inventario" passHref legacyBehavior>
          <Button variant="primary" className="mt-3">
            Volver al Inventario
          </Button>
        </Link>
      </Container>
    );
  }

  return (
    <main className="container my-5 flex-grow-1">
      <div id="detalleProductoContainer" className="row justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-lg p-4">
            <Row className="g-4">
              <Col md={6}>
                <Card.Img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="rounded shadow-sm"
                  style={{ maxHeight: "400px", objectFit: "cover" }}
                />
              </Col>
              <Col md={6} className="d-flex flex-column">
                <h1 className="text-primary fw-bold">{producto.nombre}</h1>
                <p className="lead">{producto.descripcion}</p>

                <hr />

                <div className="mb-3">
                  <span className="fs-3 fw-bold text-success me-3">
                    ${producto.precio.toLocaleString("es-CL")}
                  </span>
                  <span
                    className={`badge ${
                      producto.stock > 0 ? "bg-success" : "bg-danger"
                    }`}
                  >
                    Stock: {producto.stock}
                  </span>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <Form.Label
                    htmlFor="cantidadInput"
                    className="me-3 my-0 fw-bold"
                  >
                    Cantidad:
                  </Form.Label>
                  <Form.Control
                    type="number"
                    id="cantidadInput"
                    value={cantidad}
                    onChange={(e) =>
                      setCantidad(
                        Math.min(
                          Math.max(1, parseInt(e.target.value) || 1),
                          producto.stock
                        )
                      )
                    }
                    min="1"
                    max={producto.stock}
                    disabled={producto.stock === 0}
                    style={{ width: "80px" }}
                  />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="mt-auto"
                  onClick={handleAgregarACarrito}
                  disabled={producto.stock === 0}
                >
                  <i className="fas fa-cart-plus me-2"></i>
                  {producto.stock > 0 ? "Añadir al Carrito" : "Agotado"}
                </Button>

                {mensaje && (
                  <Alert
                    variant={mensaje.includes("Error") ? "danger" : "success"}
                    className="mt-3 text-center"
                  >
                    {mensaje}
                  </Alert>
                )}
              </Col>
            </Row>
          </Card>
        </Col>
      </div>
    </main>
  );
};

export default DetalleProducto;
