"use client";

import React, { useState } from "react";
import { Collapse } from "react-bootstrap";

export default function WeatherCard() {
  const [open, setOpen] = useState(false);

  return (
    <section
      style={{
        margin: "40px auto",
        maxWidth: 900,
        borderRadius: 24,
        padding: 32,
        background:
          "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%)",
        color: "white",
        boxShadow: "0 20px 50px rgba(91,33,182,.35)",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontWeight: 900, fontSize: 32, marginBottom: 12 }}>
        🌤 Clima de hoy
      </h2>

      <p style={{ opacity: 0.9, fontSize: 16, marginBottom: 24 }}>
        Integrado con la API publica Meteored🐾
      </p>

      <div
        style={{
          cursor: "pointer",
          padding: "18px",
          background:
            "linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #a855f7 100%)",
          color: "white",
          borderRadius: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={() => setOpen(!open)} // Al hacer click, se alterna el despliegue
      >
        <div style={{ fontWeight: "700", fontSize: "20px" }}>
          {open ? "Cerrar Clima" : "Ver Clima"}
        </div>
      </div>

      {/* Información expandida */}
      <Collapse in={open}>
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
            }}
          >
            {[
              { label: "🌡 Temperatura", value: "14° / 33°" },
              { label: "🌧 Lluvia", value: "0%" },
              { label: "💨 Viento", value: "12 km/h" },
              { label: "🐾 Consejo", value: "Buen día para pasear" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,.18)",
                  borderRadius: 18,
                  padding: 18,
                  fontWeight: 800,
                }}
              >
                <div style={{ opacity: 0.85, marginBottom: 6 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 20 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Collapse>
    </section>
  );
}
