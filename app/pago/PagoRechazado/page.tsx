import { Suspense } from "react";
import PagoRechazadoClient from "./PagoRechazadoClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PagoRechazadoClient />
    </Suspense>
  );
}
