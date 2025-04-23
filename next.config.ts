import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",         // Exporta la app como estática
  trailingSlash: true,      // Genera /dashboard/index.html, /login/index.html, etc.
  images: {
    unoptimized: true,      // No usar el optimizador de imágenes
  },
  assetPrefix: "./",        // Usa rutas relativas en los assets
};

export default nextConfig;
