📌 Google Maps Scraper con Playwright

Este proyecto utiliza Playwright para automatizar la búsqueda de negocios en Google Maps y extraer información relevante como nombres, direcciones y números de teléfono. Los datos se guardan en un archivo CSV.

🚀 Instalación

Asegúrate de tener Node.js instalado en tu sistema. Luego, clona este repositorio y ejecuta:

git clone https://github.com/tu_usuario/scraping-web.git

cd scraping-web
npm install
Esto instalará Playwright y todas las dependencias necesarias.

Para instalar los navegadores de Playwright, ejecuta:

npx playwright install

🔧 Configuración
En el archivo index.js, puedes modificar los siguientes valores:

- busqueda: Define el término de búsqueda en Google Maps.

- urlBase: URL base de búsqueda en Maps.

- guardarComoCSV(): Ruta del archivo CSV donde se guardarán los datos extraídos.


📜 Uso

Para ejecutar el scraper, corre el siguiente comando en la terminal:

node index.js

El script pedirá al usuario ingresar el rubro a buscar y luego abrirá Google Maps, hará scroll para cargar todos los resultados y extraerá los datos.

Al finalizar, los datos se guardarán en un archivo tiendas.csv.

🧪 Tests
El proyecto incluye tests automáticos con Playwright para verificar el correcto funcionamiento del scraper.

Para ejecutarlos, usa:

npx jest

Los tests validan:

Que la URL de búsqueda se construya correctamente.
Que Google Maps cargue sin errores.
Que la función de scroll funcione bien.
Que los datos extraídos contengan nombre, dirección y teléfono.
