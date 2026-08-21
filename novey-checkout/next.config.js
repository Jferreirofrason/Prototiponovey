/** @type {import('next').NextConfig} */
const nextConfig = {
  // Integración de flujo: el checkout vive bajo /checkout para poder proxearse
  // desde el dominio unificado (prototiponovey.vercel.app/checkout).
  basePath: '/checkout',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
};

module.exports = nextConfig;
