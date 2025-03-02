const { chromium } = require('playwright');
const fs = require('fs'); // Importamos fs para guardar el CSV
const path = require('path'); // Para manejar rutas

(async () => {
  // pedir al usuario el termino de la busqueda
  const busqueda = await new Promise(resolve => {
    process.stdout.write('🔍 ¿ Que rubro deseas buscar: ?');
    process.stdin.once('data', data => {
      resolve(data.toString().trim());
    });
  });

  const urlBase = 'https://www.google.com.ar/maps/search/';
  const url = urlBase + encodeURIComponent(busqueda);

  console.log(`🔗 Abriendo: ${url}`);

  const browser = await chromium.launch({ headless: false }); // Visible para depuración
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const data = [];

  // 📌 Función para hacer scroll en el contenedor de resultados
  async function scrollHastaCargarTodo() {
    console.log('📌 Haciendo scroll en la lista de tiendas...');

    const contenedor = await page.locator('.m6QErb[aria-label]'); // Contenedor de resultados de Google Maps

    let previousHeight = 0;
    let attempts = 0;

    while (attempts < 3) {
      await contenedor.evaluate(el => {
        el.scrollBy(0, el.scrollHeight); // Hace scroll en el contenedor de resultados
      });

      await page.waitForTimeout(2000); // Espera a que se cargue más contenido

      let newHeight = await contenedor.evaluate(el => el.scrollHeight);

      if (newHeight === previousHeight) {
        attempts++;
      } else {
        attempts = 0;
      }

      previousHeight = newHeight;
    }

    console.log(
      '✅ Scroll completo. Todas las tiendas deberían estar cargadas.'
    );
  }

  // 📌 Función para extraer texto de un selector
  async function extraerTexto(page, selector) {
    try {
      await page.waitForSelector(selector, { timeout: 3000 });
      return await page.$$eval(selector, elements =>
        elements.map(element => element.textContent.trim())
      );
    } catch (error) {
      console.error(
        `⚠️ Error en selector: ${selector}, no se encontraron elementos.`
      );
      return [];
    }
  }

  // 📌 Función para extraer datos actuales accediendo al segundo div.W4Efsd y su segundo span
  async function extraerDatosActuales() {
    console.log('📌 Extrayendo datos de la página actual...');

    const nombres = await extraerTexto(page, 'div.qBF1Pd.fontHeadlineSmall');

    const direccion = await extraerTexto(
      page,
      'div.W4Efsd span span:nth-child(2)'
    );

    const numero = await extraerTexto(page, 'div.W4Efsd span.UsdlK');

    for (let i = 0; i < nombres.length; i++) {
      data.push({
        nombre: nombres[i] || 'sin datos ❌',
        direccion: direccion[i] || 'sin datos ❌',
        numero: numero[i] || 'sin datos ❌',
      });
    }

    console.log(`✅ Datos extraídos: ${data.length} registros`);

    await page.close();

    await browser.close();
  }

  // 📌 Función para guardar los datos en un archivo CSV
  function guardarComoCSV(datos, nombreArchivo = 'tiendas.csv') {
    if (datos.length === 0) {
      console.error('⚠️ No hay datos para guardar.');
      return;
    }

    // Construimos el contenido del CSV
    const cabecera = 'Nombre,Dirección,numero\n';
    const filas = datos
      .map(item => `"${item.nombre}","${item.direccion}", "${item.numero}"`)
      .join('\n');
    const contenidoCSV = cabecera + filas;

    // Guardamos el archivo
    const rutaArchivo = path.join(__dirname, nombreArchivo);
    fs.writeFileSync(rutaArchivo, contenidoCSV, 'utf8');

    console.log(`✅ Datos guardados en: ${rutaArchivo}`);
  }

  await scrollHastaCargarTodo(); // Primero hace scroll en el contenedor de resultados
  await extraerDatosActuales(); // Luego extrae los datos
  guardarComoCSV(data); // Guarda los datos en un archivo CSV
})();
