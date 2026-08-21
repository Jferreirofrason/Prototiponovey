'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
import {
  PRODUCTS, OFFERS_DISCOUNT, SHIPPING, TAXES, GIFT_BALANCE, POINTS_BALANCE, POINTS_QTY,
} from './data';
import { perfilCompleto, readSession, saveSession, type Session } from './session';

export type StepId = 1 | 2 | 3 | 4 | 5; // 4 = review, 5 = confirmation
export type DeliveryType = 'domicilio' | 'tienda';
export type Recipient = 'yo' | 'otra';
export type PayMethod = 'tarjeta' | 'yappy' | 'cmf';
export type ModalId = null | 'date' | 'store' | 'addCard' | 'addAddress';

interface CheckoutState {
  /** null mientras se lee la sesión: evita mostrar el paso 1 y saltar al 2. */
  sesionLista: boolean;
  autenticado: boolean;
  /** Confirmación breve tras editar el paso 1. */
  perfilActualizado: boolean;
  step: StepId;
  maxReached: StepId;
  customerDone: boolean;
  deliveryDone: boolean;
  paymentDone: boolean;
  customer: { name: string; email: string; phone: string };
  delivery: {
    type: DeliveryType;
    addressId: string;
    recipient: Recipient;
    other: { name: string; phone: string; id: string };
    date: string;
    storeId: string;
  };
  payment: {
    method: PayMethod;
    cardId: string;
    installment: string;
    gift: { enabled: boolean; code: string; consulted: boolean; applied: boolean; amount: number };
    points: { enabled: boolean; applied: boolean; amount: number };
    billingSame: boolean;
  };
  terms: boolean;
  modal: ModalId;
  orderNumber: string;
}

const initialState: CheckoutState = {
  sesionLista: false,
  autenticado: false,
  perfilActualizado: false,
  step: 1,
  maxReached: 1,
  customerDone: false,
  deliveryDone: false,
  paymentDone: false,
  // Sin usuario de ejemplo: los datos salen de la sesión real, si existe.
  customer: { name: '', email: '', phone: '' },
  delivery: {
    type: 'tienda',
    addressId: 'home',
    recipient: 'yo',
    other: { name: '', phone: '', id: '' },
    date: 'Martes 22 de diciembre',
    storeId: 'coronado',
  },
  payment: {
    method: 'tarjeta',
    cardId: 'visa',
    installment: '',
    gift: { enabled: false, code: '', consulted: false, applied: false, amount: 0 },
    points: { enabled: false, applied: false, amount: 0 },
    billingSame: true,
  },
  terms: false,
  modal: null,
  orderNumber: 'NV-48673724',
};

export interface Totals {
  subtotal: number;
  offers: number;
  shipping: number;
  shippingCalculated: boolean;
  taxes: number;
  giftDiscount: number;
  pointsDiscount: number;
  regularTotal: number;
  total: number;
  savings: number;
}

interface CheckoutCtx {
  state: CheckoutState;
  items: typeof PRODUCTS;
  /** El carrito quedó vacío: el checkout no tiene nada que cobrar. */
  carritoVacio: boolean;
  totals: Totals;
  go: (step: StepId) => void;
  editStep: (step: StepId) => void;
  completeCustomer: () => void;
  completeDelivery: () => void;
  completePayment: () => void;
  confirmOrder: () => void;
  reset: () => void;
  update: (patch: Partial<CheckoutState>) => void;
  setDelivery: (patch: Partial<CheckoutState['delivery']>) => void;
  setPayment: (patch: Partial<CheckoutState['payment']>) => void;
  setGift: (patch: Partial<CheckoutState['payment']['gift']>) => void;
  setPoints: (patch: Partial<CheckoutState['payment']['points']>) => void;
  openModal: (m: ModalId) => void;
  closeModal: () => void;
}

/** Perfil del checkout a partir de la sesión, sin pisar lo ya tipeado. */
function desdeSesion(sesion: Session | null, s: CheckoutState): CheckoutState['customer'] {
  if (!sesion) return s.customer;
  return {
    name: s.customer.name || sesion.name || '',
    email: s.customer.email || sesion.email,
    phone: s.customer.phone || sesion.phone || '',
  };
}

const Ctx = createContext<CheckoutCtx | null>(null);

export function CheckoutProvider({ children, initialStep }: { children: ReactNode; initialStep?: StepId }) {
  const [state, setState] = useState<CheckoutState>(
    initialStep ? { ...initialState, step: initialStep, maxReached: initialStep } : initialState,
  );

  // Flujo integrado: si el PDP dejó un carrito en localStorage (mismo origen
  // bajo el dominio unificado), se usa ese producto real en lugar del demo.
  const [cart, setCart] = useState<{ items: typeof PRODUCTS; custom: boolean; vacio: boolean }>({
    items: PRODUCTS,
    custom: false,
    vacio: false,
  });
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('novey-cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items) && parsed.items.length > 0 && parsed.items[0].name) {
          setCart({ items: parsed.items, custom: true, vacio: false });
        } else if (Array.isArray(parsed.items)) {
          // Carrito vaciado a propósito: no se inventa un pedido demo.
          setCart({ items: [], custom: true, vacio: true });
        }
      }
    } catch {
      /* sin storage: se mantiene el pedido demo */
    }
  }, []);

  /**
   * Sesión: define en qué paso arranca el checkout.
   *  - sin sesión → paso 1 con el formulario vacío (invitado);
   *  - con sesión y perfil incompleto → paso 1, precargado, pidiendo lo que falta;
   *  - con sesión y perfil completo → paso 1 resumido y paso 2 abierto.
   * Corre una sola vez, antes de pintar los pasos, para no saltar de golpe.
   */
  useEffect(() => {
    const sesion = readSession();
    setState((s) => {
      // La ruta directa /checkout/confirmacion fija su propio paso.
      if (initialStep) {
        return { ...s, sesionLista: true, autenticado: !!sesion, customer: desdeSesion(sesion, s) };
      }
      const completo = perfilCompleto(sesion);
      return {
        ...s,
        sesionLista: true,
        autenticado: !!sesion,
        customer: desdeSesion(sesion, s),
        customerDone: completo,
        step: completo ? 2 : 1,
        maxReached: completo ? 2 : 1,
      };
    });
  }, [initialStep]);

  useEffect(() => {
    if (!state.perfilActualizado) return;
    const t = window.setTimeout(() => setState((s) => ({ ...s, perfilActualizado: false })), 3000);
    return () => window.clearTimeout(t);
  }, [state.perfilActualizado]);

  const update = useCallback((patch: Partial<CheckoutState>) => setState((s) => ({ ...s, ...patch })), []);
  const setDelivery = useCallback(
    (patch: Partial<CheckoutState['delivery']>) => setState((s) => ({ ...s, delivery: { ...s.delivery, ...patch } })),
    [],
  );
  const setPayment = useCallback(
    (patch: Partial<CheckoutState['payment']>) => setState((s) => ({ ...s, payment: { ...s.payment, ...patch } })),
    [],
  );
  const setGift = useCallback(
    (patch: Partial<CheckoutState['payment']['gift']>) =>
      setState((s) => ({ ...s, payment: { ...s.payment, gift: { ...s.payment.gift, ...patch } } })),
    [],
  );
  const setPoints = useCallback(
    (patch: Partial<CheckoutState['payment']['points']>) =>
      setState((s) => ({ ...s, payment: { ...s.payment, points: { ...s.payment.points, ...patch } } })),
    [],
  );

  const go = useCallback(
    (step: StepId) =>
      setState((s) => ({ ...s, step, maxReached: (Math.max(s.maxReached, step) as StepId) })),
    [],
  );
  const editStep = useCallback((step: StepId) => setState((s) => ({ ...s, step })), []);

  const completeCustomer = useCallback(
    () =>
      setState((s) => {
        // El perfil recién completado queda guardado: en la próxima visita el
        // checkout ya arranca en el paso 2.
        saveSession({
          email: s.customer.email.trim(),
          name: s.customer.name.trim(),
          phone: s.customer.phone.trim() || undefined,
        });
        return {
          ...s,
          autenticado: true,
          customerDone: true,
          // Sólo se avisa cuando fue una edición, no la primera carga.
          perfilActualizado: s.customerDone,
          step: 2,
          maxReached: Math.max(s.maxReached, 2) as StepId,
        };
      }),
    [],
  );
  const completeDelivery = useCallback(
    () => setState((s) => ({ ...s, deliveryDone: true, step: 3, maxReached: Math.max(s.maxReached, 3) as StepId })),
    [],
  );
  const completePayment = useCallback(
    () => setState((s) => ({ ...s, paymentDone: true, step: 4, maxReached: Math.max(s.maxReached, 4) as StepId })),
    [],
  );
  const confirmOrder = useCallback(() => {
    setState((s) => ({ ...s, step: 5 }));
    // URL de confirmación bajo el mismo dominio (cosmética, sin recargar)
    try {
      if (!window.location.pathname.endsWith('/confirmacion')) {
        window.history.pushState({}, '', `${window.location.pathname.replace(/\/$/, '')}/confirmacion`);
      }
    } catch {}
  }, []);
  const reset = useCallback(() => setState(initialState), []);
  const openModal = useCallback((m: ModalId) => setState((s) => ({ ...s, modal: m })), []);
  const closeModal = useCallback(() => setState((s) => ({ ...s, modal: null })), []);

  const totals = useMemo<Totals>(() => {
    const items = cart.items;
    const subtotal = items.reduce((sum, p) => sum + p.price * p.qty, 0);
    // Con carrito real: descuento = diferencia contra precio anterior; ITBMS 7%.
    const offers = cart.custom
      ? +items.reduce((sum, p) => sum + Math.max(0, (p.oldPrice ?? p.price) - p.price) * p.qty, 0).toFixed(2)
      : OFFERS_DISCOUNT;
    const taxes = cart.custom ? +(subtotal * 0.07).toFixed(2) : TAXES;
    const giftDiscount = state.payment.gift.applied ? state.payment.gift.amount : 0;
    const pointsDiscount = state.payment.points.applied ? state.payment.points.amount : 0;
    const shippingCalculated = state.deliveryDone || state.step >= 3;
    const regularTotal = subtotal + SHIPPING + taxes;
    const total = regularTotal - offers - giftDiscount - pointsDiscount;
    const savings = offers + giftDiscount + pointsDiscount;
    return {
      subtotal,
      offers,
      shipping: SHIPPING,
      shippingCalculated,
      taxes,
      giftDiscount,
      pointsDiscount,
      regularTotal,
      total,
      savings,
    };
  }, [cart, state.payment.gift, state.payment.points, state.deliveryDone, state.step]);

  const value: CheckoutCtx = {
    state,
    items: cart.items,
    carritoVacio: cart.vacio,
    totals,
    go,
    editStep,
    completeCustomer,
    completeDelivery,
    completePayment,
    confirmOrder,
    reset,
    update,
    setDelivery,
    setPayment,
    setGift,
    setPoints,
    openModal,
    closeModal,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCheckout() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}

export { GIFT_BALANCE, POINTS_BALANCE, POINTS_QTY };
