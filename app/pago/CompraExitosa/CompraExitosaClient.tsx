"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button } from "react-bootstrap";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";

type Item = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
};

const norm = (src: string) => (src?.startsWith("/") ? src : `/${src}`);

export default function CompraExitosaClient() {
  const sp = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [totals, setTotals] = useState<{
    subtotal: number;
    descuento: number;
    total: number;
  }>({
    subtotal: 0,
    descuento: 0,
    total: 0,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("kp_success_order");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setItems(Array.isArray(parsed.items) ? parsed.items : []);
        setTotals(
          parsed && typeof parsed === "object"
            ? {
                subtotal: Number(parsed.subtotal || 0),
                descuento: Number(parsed.descuento || 0),
                total: Number(parsed.total || 0),
              }
            : { subtotal: 0, descuento: 0, total: 0 }
        );
      } catch {}
    } else {
      const total = Number(sp.get("total") || 0);
      const count = Number(sp.get("items") || 0);
      setItems([]);
      setTotals({ subtotal: total, descuento: 0, total });
    }
  }, [sp]);

  const subtotalFmt = useMemo(
    () => totals.subtotal.toLocaleString("es-CL"),
    [totals.subtotal]
  );
  const descuentoFmt = useMemo(
    () => totals.descuento.toLocaleString("es-CL"),
    [totals.descuento]
  );
  const totalFmt = useMemo(
    () => totals.total.toLocaleString("es-CL"),
    [totals.total]
  );

  return (
    <main className="container my-5 d-flex justify-content-center">
      <div style={{ width: "100%", maxWidth: 980 }}>
        <Card className="shadow-lg border-0">
          <div className="px-4 pt-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ background: "#e8f5e9", color: "#2e7d32", height: 56 }}
            >
              <i className="fas fa-check me-2"></i>
              <span className="fw-bold">Compra exitosa</span>
            </div>
          </div>

          <div className="p-4">
            <p className="text-muted text-center mb-4">
              Tu pago fue procesado correctamente.
            </p>

            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <h6 className="text-primary mb-3">Productos comprados</h6>
                {items.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center">
                      No se encontraron ítems para esta compra.
                    </Card.Body>
                  </Card>
                ) : (
                  <div className="d-grid gap-3">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="d-flex align-items-center justify-content-between p-3 rounded-3"
                        style={{ background: "#f3e8ff" }}
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={norm(it.imagen)}
                            alt={it.nombre}
                            width={56}
                            height={56}
                            style={{ objectFit: "contain", borderRadius: 6 }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/placeholder.jpg";
                            }}
                            className="me-3"
                          />
                          <div className="me-3" style={{ minWidth: 0 }}>
                            <div
                              className="fw-semibold text-primary"
                              style={{ lineHeight: 1.1 }}
                            >
                              {it.nombre}
                            </div>
                            <small className="text-muted">
                              ${it.precio.toLocaleString("es-CL")} c/u ×{" "}
                              {it.cantidad}
                            </small>
                          </div>
                        </div>
                        <div className="fw-bold" style={{ color: "#007f4e" }}>
                          ${(it.precio * it.cantidad).toLocaleString("es-CL")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-12 col-lg-5">
                <h6 className="text-primary mb-3">Resumen</h6>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal</span>
                      <span>${subtotalFmt}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Descuento</span>
                      <span className="text-success">- ${descuentoFmt}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total pagado</span>
                      <span>${totalFmt}</span>
                    </div>
                    <div className="d-grid gap-3 mt-4">
                      <Link href="/inventario" className="btn btn-primary">
                        Seguir comprando
                      </Link>
                      <Link href="/" className="btn btn-outline-primary">
                        Volver al inicio
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
