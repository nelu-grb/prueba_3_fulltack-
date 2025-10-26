"use client";
import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Link from "next/link";

const Blog: React.FC = () => {
  return (
    <main className="container my-5">
      <h2 className="text-primary mb-4 text-center">Noticias y Novedades</h2>

      <article className="mb-5 shadow-sm p-4 rounded border">
        <Row xs={1} md={2} className="g-3 align-items-center">
          <Col>
            <h3 className="fw-bold text-secondary">
              Lanzamiento de nuestra nueva línea de juguetes ecológicos
            </h3>
            <p className="text-muted">
              <small>Publicado el 10 de junio de 2025</small>
            </p>
            <p>
              En KittyPatitasSuaves nos preocupamos por el medio ambiente y el
              bienestar de tus mascotas. Por eso, hemos lanzado una nueva línea
              de juguetes fabricados con materiales reciclados y seguros para
              perros y gatos. ¡Ven a descubrirlos en nuestra tienda!
            </p>
          </Col>
          <Col className="text-center">
            <img
              src="img/rascador-para-gatos-cat-scratch.jpg"
              alt="Juguetes ecológicos para mascotas"
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>
      </article>

      <article className="mb-5 shadow-sm p-4 rounded border">
        <Row xs={1} md={2} className="g-3 align-items-center">
          <Col className="order-md-2">
            <h3 className="fw-bold text-secondary">
              Promoción especial en alimentos para gatos
            </h3>
            <p className="text-muted">
              <small>Publicado el 1 de junio de 2025</small>
            </p>
            <p>
              Durante todo el mes de junio, disfruta de un 20% de descuento en
              nuestra selección de alimentos premium para gatos. Alimenta a tu
              felino con lo mejor y ahorra en tu compra.
            </p>
          </Col>
          <Col className="order-md-1 text-center">
            <img
              src="img/Post de Instagram de alimento para mascota divertido en color rosado.png"
              alt="Alimentos para gatos en promoción"
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>
      </article>

      <article className="mb-5 shadow-sm p-4 rounded border">
        <Row xs={1} md={2} className="g-3 align-items-center">
          <Col>
            <h3 className="fw-bold text-secondary">
              Consejos para el cuidado de tu mascota en verano
            </h3>
            <p className="text-muted">
              <small>Publicado el 25 de mayo de 2025</small>
            </p>
            <p>
              El verano puede ser un reto para nuestras mascotas. En nuestro
              blog te compartimos consejos útiles para mantener a tu perro o
              gato fresco, hidratado y feliz durante los días calurosos.
            </p>
          </Col>
          <Col className="text-center">
            <img
              src="img/Post de instagram mascotas tienda moderno verde.png"
              alt="Mascota feliz en verano"
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>
      </article>

      <div className="text-center">
        <Link href="/" passHref legacyBehavior>
          <Button variant="primary">Volver al Inicio</Button>
        </Link>
      </div>
    </main>
  );
};

export default Blog;
