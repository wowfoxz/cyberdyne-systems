from pathlib import Path

html = Path("/var/www/misitio/index.html")
texto = html.read_text(encoding="utf-8")
viejo = """          <article class=\"proyecto proximo\" data-stagger>
            <div class=\"proyecto-cabecera\">
              <img
                class=\"proyecto-logo\"
                src=\"/assets/marcas/cyberdyne.svg\"
                alt=\"\"
                width=\"46\"
                height=\"46\"
              />
              <h2>Cyberdyne Systems</h2>
            </div>
            <p>Simulador de la computadora de Terminator</p>
          </article>"""
nuevo = """          <a class=\"proyecto activo\" href=\"/cyberdyne/\" data-stagger>
            <div class=\"proyecto-cabecera\">
              <img
                class=\"proyecto-logo\"
                src=\"/assets/marcas/cyberdyne.svg\"
                alt=\"\"
                width=\"46\"
                height=\"46\"
              />
              <h2>Cyberdyne Systems</h2>
            </div>
            <p>Simulador de la computadora de Terminator</p>
            <span class=\"proyecto-cta\">Abrir</span>
          </a>"""
if viejo not in texto:
    raise SystemExit("no encontre la tarjeta de Cyberdyne")
html.write_text(texto.replace(viejo, nuevo, 1), encoding="utf-8")
print("tarjeta ok")

nginx = Path("/etc/nginx/sites-enabled/misitio")
conf = nginx.read_text(encoding="utf-8")
if "location /cyberdyne/" not in conf:
    bloque = """
location = /cyberdyne { return 301 /cyberdyne/; }

location /cyberdyne/ {
    proxy_pass http://192.168.243.95:8790/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 600s;
    proxy_buffering off;
}
"""
    cierre = conf.rfind("}")
    conf = conf[:cierre] + bloque + "\n}\n"
    nginx.write_text(conf, encoding="utf-8")
print("nginx ok")
