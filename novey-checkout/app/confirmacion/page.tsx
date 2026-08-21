'use client';

import { CheckoutProvider } from '../../lib/checkout-context';
import { ConfirmationPage } from '../../components/checkout/ConfirmationPage';

// Ruta directa de la confirmación (/checkout/confirmacion): permite recargar
// o compartir la pantalla final. El carrito se recupera de localStorage.
export default function ConfirmacionRoute() {
  return (
    <CheckoutProvider initialStep={5}>
      <ConfirmationPage />
    </CheckoutProvider>
  );
}
