import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Novey · Checkout',
  description: 'Prototipo navegable del checkout — Novey',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
