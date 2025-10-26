"use client";

import React, { useState, useEffect } from "react";
import { Nav, Container, Offcanvas, Button, Badge } from "react-bootstrap";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { usePathname } from "next/navigation";

const NavbarComponent: React.FC = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  // 🔁 Actualizar el contador leyendo localStorage
  const actualizarContadorCarrito = () => {
    if (typeof window !== "undefined") {
      const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
      const totalItems = carrito.reduce(
        (sum: number, item: { cantidad: number }) => sum + item.cantidad,
        0
      );
      setCartCount(totalItems);
    }
  };

  useEffect(() => {
    actualizarContadorCarrito();

    // Escuchar el evento personalizado que se dispara al agregar productos
    const handleCarritoActualizado = () => actualizarContadorCarrito();

    window.addEventListener("carritoActualizado", handleCarritoActualizado);
    window.addEventListener("storage", actualizarContadorCarrito);

    return () => {
      window.removeEventListener(
        "carritoActualizado",
        handleCarritoActualizado
      );
      window.removeEventListener("storage", actualizarContadorCarrito);
    };
  }, []);

  const links = [
    { path: "/", label: "Inicio", isCart: false },
    { path: "/registro", label: "Registro", isCart: false },
    { path: "/acceso", label: "Acceder", isCart: false },
    { path: "/inventario", label: "Productos", isCart: false },
    { path: "/pago", label: "Mi carrito", isCart: true, showBadge: true },
    { path: "/contacto", label: "Contacto", isCart: false },
    { path: "/blog", label: "Blog", isCart: false },
    { path: "/nosotros", label: "Nosotros", isCart: false },
  ];

  const renderBadge = (count: number, id: string) => (
    <Badge id={id} bg="secondary" pill className={`ms-1`}>
      {count}
    </Badge>
  );

  const renderDesktopLinkContent = (link: (typeof links)[0]) => {
    if (link.isCart) {
      return (
        <>
          {link.label}
          {renderBadge(cartCount, "cart-count-desktop")}
        </>
      );
    }
    return link.label;
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/" || pathname === "/inicio";
    }
    return pathname === path;
  };

  // 🧠 NUEVA FUNCIÓN: Ir a pagar y asegurar que el carrito esté actualizado
  const irAPagar = () => {
    if (typeof window !== "undefined") {
      // Disparar evento de actualización (por si el carrito cambió)
      window.dispatchEvent(new CustomEvent("carritoActualizado"));
      // Cerrar el menú
      handleClose();
      // Redirigir a la página de pago
      window.location.href = "/pago";
    }
  };

  return (
    <>
      <header className="main-header bg-dark text-white">
        <Container className="d-flex justify-content-between align-items-center py-3 flex-wrap">
          <Link
            href="/"
            className="text-decoration-none text-white"
            legacyBehavior
          >
            <h1 className="m-0 site-title fs-4 fs-lg-2">KittyPatitasSuaves</h1>
          </Link>

          {/* Menú escritorio */}
          <nav role="navigation" className="main-nav d-none d-lg-block">
            <ul className="list-unstyled d-flex m-0">
              {links.map((link, index) => (
                <li
                  key={index}
                  className={`nav-item ${
                    link.isCart ? "position-relative" : ""
                  }`}
                >
                  <Link href={link.path} passHref legacyBehavior>
                    <a
                      className={`nav-link px-3 ${
                        isActive(link.path) ? "active" : ""
                      }`}
                    >
                      {renderDesktopLinkContent(link)}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Botón Hamburguesa */}
          <Button
            className="btn btn-outline-secondary menu-hamburguesa d-lg-none"
            type="button"
            onClick={handleShow}
            aria-controls="offcanvasMenu"
            aria-label="Abrir menú"
          >
            <img src="/img/huella.png" alt="Menú" className="menu-icon" />
          </Button>
        </Container>
      </header>

      {/* Menú Móvil (Offcanvas) */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleClose}
        placement="end"
        id="offcanvasMenu"
        aria-labelledby="offcanvasMenuLabel"
        className="offcanvas-end"
        tabIndex={-1}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="offcanvasMenuLabel">Menú</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0 d-flex flex-column h-100">
          <ul className="list-unstyled m-0 flex-grow-1">
            {links
              .filter((link) => !link.isCart)
              .map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className={`text-decoration-none offcanvas-nav-link d-block px-3 py-2 ${
                      isActive(link.path) ? "active" : ""
                    }`}
                    onClick={handleClose}
                    legacyBehavior
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
          </ul>

          {/* 🟢 Parte inferior: contador + botón funcional "IR A PAGAR" */}
          <div className="p-3 border-top mt-auto bg-light">
            <div className="d-flex justify-content-start align-items-center mb-3">
              <span className="text-muted fs-6 me-2">Items en carrito:</span>
              <span className="fw-bold fs-5 text-primary">{cartCount}</span>
            </div>

            <Button
              variant="primary"
              className="w-100 py-2 fs-5"
              onClick={irAPagar}
              disabled={cartCount === 0}
            >
              <i className="fas fa-money-check-alt me-2"></i>
              IR A PAGAR
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavbarComponent;
