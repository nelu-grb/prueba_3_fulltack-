import { Suspense } from "react";
import CompraExitosaClient from "./CompraExitosaClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CompraExitosaClient />
    </Suspense>
  );
}
