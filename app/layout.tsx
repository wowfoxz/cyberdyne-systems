import HashRouter from "@/components/HashRouter";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <base href="./" />
        <link rel="stylesheet" href="./styles/global.css" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body>
        <HashRouter />
        {children}
      </body>
    </html>
  );
}
