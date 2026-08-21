/** @type {import('next').NextConfig} */
const PLP_ORIGIN = 'https://novey-plp-y-pdp.vercel.app';
const CHECKOUT_ORIGIN = 'https://novey-checkout.vercel.app';

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  // Integración de flujos bajo un único dominio:
  // /productos(/producto/:id) → app PLP/PDP · /checkout → app Checkout.
  // /assets e /img son los estáticos de la app PLP/PDP (no colisionan con
  // los de esta app, que usa /_next, /images y /figma).
  async rewrites() {
    return [
      { source: '/productos', destination: `${PLP_ORIGIN}/productos` },
      { source: '/productos/:path*', destination: `${PLP_ORIGIN}/productos/:path*` },
      { source: '/assets/:path*', destination: `${PLP_ORIGIN}/assets/:path*` },
      { source: '/img/:path*', destination: `${PLP_ORIGIN}/img/:path*` },
      { source: '/checkout', destination: `${CHECKOUT_ORIGIN}/checkout` },
      { source: '/checkout/:path*', destination: `${CHECKOUT_ORIGIN}/checkout/:path*` },
    ];
  },
};

module.exports = nextConfig;
