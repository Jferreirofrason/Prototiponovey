import './globals.css';
import type { Metadata } from 'next';
import ToastHost from '../components/ToastHost';

export const metadata: Metadata = {
  title: 'Novey · Todo para tu hogar y proyectos',
  description:
    'Novey — ferretería y hogar en Panamá. Ofertas, entrega el mismo día, marcas exclusivas y todo para tus proyectos.',
  openGraph: {
    title: 'Novey · Todo para tu hogar y proyectos',
    description:
      'Ofertas, entrega el mismo día, marcas exclusivas y todo para tus proyectos.',
    locale: 'es_PA',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
