"use client";
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";

interface Mensaje {
  texto: string;
  tipo: "success" | "danger";
}

interface ContactoData {
  nombreContacto: string;
  correoContacto: string;
  comentarioContacto: string;
}

const initialContactoData: ContactoData = {
  nombreContacto: "",
  correoContacto: "",
  comentarioContacto: "",
};

const Contacto: React.FC = () => {
  const [formData, setFormData] = useState<ContactoData>(initialContactoData);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [validated, setValidated] = useState(false);

  const regexCorreo =
    /^(?=.{1,100}$)([a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com))$/;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setMensaje(null);
  };

  const validarFormulario = (): boolean => {
    return (
      formData.nombreContacto.trim().length > 0 &&
      formData.nombreContacto.length <= 100 &&
      regexCorreo.test(formData.correoContacto) &&
      formData.comentarioContacto.trim().length > 0 &&
      formData.comentarioContacto.trim().length <= 500
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidated(true);

    const esValido = validarFormulario();

    if (esValido) {
      setMensaje({
        texto:
          "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.",
        tipo: "success",
      });

      setFormData(initialContactoData);
      setValidated(false);
    } else {
      setMensaje({
        texto: "Por favor, corrige los errores en el formulario.",
        tipo: "danger",
      });
    }
  };

  return (
    <main className="container my-5">
      <Row className="justify-content-center">
        <Col md={20} lg={10}>
          <Card className="shadow-lg p-4">
            <h2 className="card-title text-center text-primary mb-4">
              Contáctanos
            </h2>
            <p className="text-center text-muted mb-4">
              ¿Tienes alguna pregunta, queja o sugerencia? ¡Envíanos un mensaje!
            </p>
            <Form
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
              id="formularioContacto"
            >
              <Form.Group className="mb-3" controlId="nombreContacto">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nombreContacto}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  isInvalid={
                    validated &&
                    (formData.nombreContacto.trim() === "" ||
                      formData.nombreContacto.length > 100)
                  }
                  placeholder="Tu Nombre"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa tu nombre (máx. 100 caracteres).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="correoContacto">
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.correoContacto}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  isInvalid={
                    validated && !regexCorreo.test(formData.correoContacto)
                  }
                  placeholder="tu@duoc.cl / tu@gmail.com / @profesor.duoc.cl"
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa un correo válido (@duoc.cl,
                  @profesor.duoc.cl, @gmail.com, máx. 100 caracteres).
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="comentarioContacto">
                <Form.Label>Comentario</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={formData.comentarioContacto}
                  onChange={handleChange}
                  required
                  maxLength={500}
                  isInvalid={
                    validated &&
                    (formData.comentarioContacto.trim() === "" ||
                      formData.comentarioContacto.length > 500)
                  }
                  placeholder="Escribe tu mensaje aquí..."
                />
                <Form.Control.Feedback type="invalid">
                  Por favor, ingresa tu comentario (máx. 500 caracteres).
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-center mt-3">
                <Button type="submit" variant="primary" className="px-5">
                  Enviar Mensaje
                </Button>
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

export default Contacto;
