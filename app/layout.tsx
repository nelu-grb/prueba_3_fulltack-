import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";
import HeaderComponent from "../componentes/header";
import FooterComponent from "../componentes/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KittyPatitasSuaves",
  description: "Todo para tu mascota, tu tienda de confianza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-light`}
      >
        <div className="d-flex flex-column min-vh-100">
          <HeaderComponent />
          <main className="flex-grow-1">{children}</main>
          <FooterComponent />
        </div>
      </body>
    </html>
  );
}
