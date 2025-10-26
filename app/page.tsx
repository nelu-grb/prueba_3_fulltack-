"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Link from "next/link";
import { todosLosProductos, Producto } from "../app/Data";
import "@fortawesome/fontawesome-free/css/all.min.css";

const getFeaturedProducts = (
  productos: typeof todosLosProductos
): Producto[] => {
  const featured: Producto[] = [];
  featured.push(...productos.juguetes.slice(0, 1));
  featured.push(...productos.accesorios.slice(0, 1));
  featured.push(...productos.alimentos.slice(0, 1));
  return featured;
};

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const productosDestacados = getFeaturedProducts(todosLosProductos);

  if (loading) {
    return (
      <div id="loading" className="loading">
        <i className="fas fa-paw fa-6x text-white"></i>
      </div>
    );
  }

  return (
    <main role="main" className="container my-5">
      <section className="hero-section text-center mb-5">
        <h2 className="display-4 fw-bold text-primary mb-3">
          Bienvenido a KittyPatitasSuaves
        </h2>
        <p className="lead text-muted mb-4">
          Tu tienda especializada en juguetes innovadores y entretenidos para
          mascotas.
        </p>

        {/* 🎯 CORRECCIÓN: La imagen grande ahora es un Link con la clase hero-image-link */}
        <Link href="/inventario" passHref legacyBehavior>
          <a className="hero-image-link d-inline-block">
            <img
              src="img/Banner Tienda Online Mercado Shop Mascotas Curvo Celeste y Azul.png"
              alt="Explorar todos los productos de KittyPatitasSuaves"
              className="img-fluid rounded shadow-lg hero-banner-clickable"
            />
          </a>
        </Link>
      </section>

      <section className="product-categories">
        <h3 className="text-center text-primary mb-4">
          Explora Nuestras Categorías
        </h3>
        <Row xs={1} md={3} className="g-4">
          <Col>
            <Card className="h-100 shadow-sm category-card">
              <Card.Img
                variant="top"
                src="img/jugete.png"
                alt="Juguetes para mascotas"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title className="text-primary fw-bold">
                  Juguetes para Mascotas
                </Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Diversos juguetes para perros, gatos y más.
                </Card.Text>
                <Link href="/inventario?categoria=juguetes" legacyBehavior>
                  <Button variant="primary" className="mt-auto">
                    Explorar Juguetes
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 shadow-sm category-card">
              <Card.Img
                variant="top"
                src="img/accesorio.jpg"
                alt="Accesorios para mascotas"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title className="text-primary fw-bold">
                  Accesorios
                </Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Collares, correas y más para tus mascotas.
                </Card.Text>
                <Link href="/inventario?categoria=accesorios" legacyBehavior>
                  <Button variant="primary" className="mt-auto">
                    Ver Accesorios
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="h-100 shadow-sm category-card">
              <Card.Img
                variant="top"
                src="img/gatocomida.png"
                alt="Alimentos para mascotas"
              />
              <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title className="text-primary fw-bold">
                  Alimentos
                </Card.Title>
                <Card.Text className="text-muted text-center flex-grow-1">
                  Comida saludable para tus mascotas.
                </Card.Text>
                <Link href="/inventario?categoria=alimentos" legacyBehavior>
                  <Button variant="primary" className="mt-auto">
                    Descubre Alimentos
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </main>
  );
};

export default Home;
