"use client";

import React, { useState } from "react";
import { Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import Link from "next/link";

const API_BASE_URL =
  "https://gateway-kittipatitassuaves3-production.up.railway.app";

interface Mensaje {
  texto: string;
  tipo: "success" | "danger";
}

interface Mascota {
  tipo: string;
  nombre: string;
}

interface UsuarioCompleto {
  id?: number;
  nombreCompleto?: string;
  correoElectronico?: string;
  mascotas?: Mascota[];
}

const Acceso: React.FC = () => {
  const [correoAcceso, setCorreoAcceso] = useState("");
  const [contrasenaAcceso, setContrasenaAcceso] = useState("");
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [validated, setValidated] = useState(false);

  const regexCorreoAcceso =
    /^(?=.{1,100}$)([a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com))$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);
    setMensaje(null);

    const form = e.currentTarget;

    if (!form.checkValidity() || !regexCorreoAcceso.test(correoAcceso)) {
      setMensaje({
        texto: "Por favor, rellena correctamente todos los campos.",
        tipo: "danger",
      });
      return;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correoElectronico: correoAcceso,
          contrasena: contrasenaAcceso,
        }),
      });

      const text = await resp.text();

      if (!resp.ok) {
        setMensaje({
          texto:
            text ||
            "Credenciales incorrectas. Verifica tu correo y contraseña.",
          tipo: "danger",
        });
        return;
      }

      const usuarioRegistrado: UsuarioCompleto = JSON.parse(text);

      const nombreUsuario =
        usuarioRegistrado.nombreCompleto?.trim().split(" ")[0] || "Usuario";
      const correoUsuario = usuarioRegistrado.correoElectronico || correoAcceso;

      let mensajeMascotas = "";

      if (usuarioRegistrado.mascotas && usuarioRegistrado.mascotas.length > 0) {
        const mascotasList = usuarioRegistrado.mascotas
          .filter((m) => m.tipo && m.nombre)
          .map((m) => `${m.tipo}: ${m.nombre}`)
          .join(", ");

        if (mascotasList) {
          mensajeMascotas = ` (Mascotas: ${mascotasList})`;
        }
      }

      const mensajeExito = `¡Inicio de sesión exitoso! Bienvenido, ${nombreUsuario} (${correoUsuario})${mensajeMascotas}`;

      localStorage.setItem("authData", JSON.stringify(usuarioRegistrado));
      localStorage.setItem("isLoggedIn", "1");
      sessionStorage.setItem(
        "sesionActiva",
        JSON.stringify({ correo: correoUsuario, activo: true })
      );
      window.dispatchEvent(new Event("authChanged"));

      setMensaje({ texto: mensajeExito, tipo: "success" });
    } catch (error) {
      setMensaje({
        texto: "Error de conexión con el servidor. Intenta más tarde.",
        tipo: "danger",
      });
    }
  };

  return (
    <main className="container my-5 flex-grow-1">
      <Row className="justify-content-center">
        <Col md={80} lg={30}>
          <Card className="shadow-lg p-4">
            <h2 className="card-title text-center text-primary mb-4">
              Inicio de Sesión
            </h2>

            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="correoAcceso">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={correoAcceso}
                  onChange={(e) => setCorreoAcceso(e.target.value)}
                  required
                  isInvalid={validated && !regexCorreoAcceso.test(correoAcceso)}
                  placeholder="tu@ejemplo.com"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa un correo válido (@duoc.cl,
                  @profesor.duoc.cl o @gmail.com).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="contrasenaAcceso">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={contrasenaAcceso}
                  onChange={(e) => setContrasenaAcceso(e.target.value)}
                  required
                  placeholder="********"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa tu contraseña.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-center mt-4">
                <Button variant="primary" type="submit" className="px-5">
                  Iniciar Sesión
                </Button>
              </div>

              <div className="mt-3 text-center">
                <Link
                  href="#"
                  className="text-decoration-none text-primary-hover"
                  legacyBehavior
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {mensaje && (
                <Alert variant={mensaje.tipo} className="mt-3 text-center">
                  {mensaje.texto}
                </Alert>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </main>
  );
};

export default Acceso;
