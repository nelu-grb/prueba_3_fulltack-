"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useRouter, useSearchParams } from "next/navigation";

type Item = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
};

const norm = (src: string) => (src?.startsWith("/") ? src : `/${src}`);

export default function PagoRechazado() {
  const router = useRouter();
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
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    const p = JSON.parse(sessionStorage.getItem("kp_pending_cart") || "[]");
    const t = JSON.parse(sessionStorage.getItem("kp_pending_totals") || "{}");
    const r =
      sp.get("error") ||
      sessionStorage.getItem("kp_pending_reason") ||
      "Formulario incompleto. Revisa los campos requeridos.";
    setItems(Array.isArray(p) ? p : []);
    setTotals(
      t && typeof t === "object"
        ? {
            subtotal: t.subtotal || 0,
            descuento: t.descuento || 0,
            total: t.total || 0,
          }
        : { subtotal: 0, descuento: 0, total: 0 }
    );
    setReason(r);
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

  const corregir = () => {
    const p = sessionStorage.getItem("kp_pending_cart");
    const stock = sessionStorage.getItem("kp_pending_stock");
    if (p) {
      const arr = JSON.parse(p);
      localStorage.setItem(
        "carrito",
        JSON.stringify(
          Array.isArray(arr)
            ? arr.map((x: any) => ({ id: x.id, cantidad: x.cantidad }))
            : []
        )
      );
    }
    if (stock) {
      sessionStorage.setItem("stockActual", stock);
    }
    window.dispatchEvent(new Event("carritoActualizado"));
    router.push("/pago");
  };

  const seguirComprando = () => {
    localStorage.removeItem("carrito");
    sessionStorage.removeItem("stockActual");
    sessionStorage.removeItem("kp_pending_cart");
    sessionStorage.removeItem("kp_pending_stock");
    sessionStorage.removeItem("kp_pending_totals");
    sessionStorage.removeItem("kp_pending_reason");
    window.dispatchEvent(new Event("carritoActualizado"));
    router.push("/inventario");
  };

  return (
    <main className="container my-5 d-flex justify-content-center">
      <div style={{ maxWidth: 980, width: "100%" }}>
        <Card className="shadow-lg border-0 mx-auto" style={{ maxWidth: 980 }}>
          <div className="px-4 pt-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ background: "#ef4444", color: "#fff", height: 56 }}
            >
              <i className="fas fa-times-circle me-2"></i>
              <span className="fw-bold">Pago Rechazado</span>
            </div>
          </div>

          <div className="p-4">
            <Alert variant="danger" className="text-center mb-4">
              {reason}
            </Alert>

            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <h6 className="text-primary mb-3">Productos pendientes</h6>
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
                            (e.target as HTMLImageElement).src =
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
                      <div className="fw-bold">
                        ${(it.precio * it.cantidad).toLocaleString("es-CL")}
                      </div>
                    </div>
                  ))}
                </div>
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
                      <span>Total</span>
                      <span>${totalFmt}</span>
                    </div>

                    <div className="d-flex gap-3 mt-4 flex-wrap">
                      <Button
                        variant="primary"
                        className="flex-grow-1 py-3"
                        onClick={corregir}
                      >
                        <i className="fas fa-rotate-left me-2"></i>
                        Corregir y reintentar
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="flex-grow-1 py-3"
                        onClick={seguirComprando}
                      >
                        <i className="fas fa-bag-shopping me-2"></i>
                        Seguir comprando
                      </Button>
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
