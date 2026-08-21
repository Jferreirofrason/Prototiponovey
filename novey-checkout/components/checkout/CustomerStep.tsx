'use client';

import { useEffect, useRef, useState } from 'react';
import { useCheckout } from '../../lib/checkout-context';
import { emailValido } from '../../lib/session';
import { Button, Input } from '../ui';

type Errores = { name?: string; email?: string };

export function CustomerStep() {
  const { state, update, completeCustomer, editStep } = useCheckout();
  const c = state.customer;

  // Copia de los valores al abrir: "Cancelar" los restaura tal cual estaban.
  const original = useRef(c);
  const [errores, setErrores] = useState<Errores>({});
  // Sin errores hasta que el usuario intente continuar.
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const primerCampo = useRef<HTMLInputElement>(null);

  // Al abrir el paso, el foco va al primer campo editable.
  useEffect(() => {
    primerCampo.current?.focus({ preventScroll: true });
  }, []);

  // El paso 1 ya estaba completo: se está editando, no completando.
  const editando = state.customerDone;
  // Faltantes de un perfil autenticado a medias (no es un error del usuario).
  const faltantes = state.autenticado && !editando && (!c.name.trim() || !emailValido(c.email));

  const validar = (): Errores => {
    const e: Errores = {};
    if (c.name.trim().length < 2) e.name = 'Ingresa tu nombre completo';
    if (!emailValido(c.email)) e.email = 'Ingresa un correo electrónico válido';
    return e;
  };

  const onGuardar = () => {
    if (guardando) return; // evita envíos duplicados
    setIntentado(true);
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    setGuardando(true);
    // El guardado es local; el estado de carga evita el doble submit y deja
    // el lugar listo para cuando haya una llamada real.
    window.setTimeout(() => {
      setGuardando(false);
      completeCustomer();
    }, 250);
  };

  const onCancelar = () => {
    update({ customer: original.current });
    setErrores({});
    setIntentado(false);
    editStep(2);
  };

  return (
    <div className="flex flex-col gap-4">
      {faltantes && (
        <p className="rounded-lg bg-feedback-warning-bg px-3.5 py-3 text-sm text-text-secondary">
          Completa estos datos para continuar con tu compra.
        </p>
      )}

      <Input
        ref={primerCampo}
        label="Nombre completo"
        value={c.name}
        onChange={(v) => {
          update({ customer: { ...c, name: v } });
          if (intentado) setErrores((prev) => ({ ...prev, name: undefined }));
        }}
        error={intentado ? errores.name : undefined}
        required
      />
      <Input
        label="Correo electrónico"
        type="email"
        value={c.email}
        onChange={(v) => {
          update({ customer: { ...c, email: v } });
          if (intentado) setErrores((prev) => ({ ...prev, email: undefined }));
        }}
        error={intentado ? errores.email : undefined}
        required
      />
      <Input
        label="Teléfono (opcional)"
        value={c.phone}
        onChange={(v) => update({ customer: { ...c, phone: v } })}
      />

      <Button full onClick={onGuardar} disabled={guardando}>
        {guardando ? 'Guardando…' : editando ? 'Guardar y continuar' : 'Continuar'}
      </Button>

      {editando ? (
        <button
          type="button"
          onClick={onCancelar}
          className="min-h-11 self-center px-3 text-sm font-medium text-text-secondary hover:underline"
        >
          Cancelar
        </button>
      ) : (
        <a
          href="/carrito"
          className="min-h-11 self-center px-3 py-3 text-sm text-text-secondary hover:underline"
        >
          ‹ Volver al carrito
        </a>
      )}
    </div>
  );
}
