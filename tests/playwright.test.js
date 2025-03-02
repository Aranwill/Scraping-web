// @ts-check
import { test, expect, chromium } from '@playwright/test';
const fs = require('fs');
const path = require('path');
require('../index.js'); // Importamos la función desde index.js

// 📌 Configuración de URL base
const urlBase = 'https://www.google.com.ar/maps/search/';

// 📌 Función para construir la URL
function construirURL(busqueda) {
  return urlBase + busqueda;
}

// 📌 Tests de Playwright
test.describe('Google Maps Scraper', () => {
  let browser;
  let page;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true }); // Modo sin UI
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  // ✅ Test 2: Verificar que la página de Google Maps se abre sin errores
  test('Debe cargar la página de Google Maps correctamente', async () => {
    await page.goto(construirURL('restaurantes'), { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/maps/);
  });
});

test('Pruebas para la función guardarCSV', () => {
  const testFilePath = path.join(__dirname, 'test_output.csv');
});

// ✅ Test 1: Verificar que la URL se construye correctamente
test('Debe construir la URL correctamente', async () => {
  const busqueda = 'farmacias';
  const urlEsperada = 'https://www.google.com.ar/maps/search/farmacias';
  expect(construirURL(busqueda)).toBe(urlEsperada);
});

// ✅ Test 2: Verificar que se extrae el texto correctamente
test('Debe extraer el texto correctamente', async () => {
  const busqueda = 'indumentaria';
  const urlEsperada = 'https://www.google.com.ar/maps/search/indumentaria';
  expect(construirURL(busqueda)).toBe(urlEsperada);
});

// 📌 Función para extraer texto desde un selector
async function extraerTexto(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    return await page.$$eval(selector, elements =>
      elements.map(element => element.textContent.trim())
    );
  } catch (error) {
    return [];
  }
}

// 📌 Función que queremos testear
async function extraerDatosActuales(page) {
  console.log('📌 Extrayendo datos de la página actual...');

  const nombres = await extraerTexto(page, 'div.qBF1Pd.fontHeadlineSmall');
  const direccion = await extraerTexto(
    page,
    'div.W4Efsd span span:nth-child(2)'
  );
  const numero = await extraerTexto(page, 'div.W4Efsd span.UsdlK');

  const data = [];
  for (let i = 0; i < nombres.length; i++) {
    data.push({
      nombre: nombres[i] || 'sin datos ❌',
      direccion: direccion[i] || 'sin datos ❌',
      numero: numero[i] || 'sin datos ❌',
    });
  }

  return data;
}

// 📌 Test de Playwright para `extraerDatosActuales()`
test.describe('Test de extracción de datos en Google Maps', () => {
  let browser;
  let page;

  test.beforeAll(async () => {
    browser = await chromium.launch({ headless: true }); // Sin UI
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('Debe extraer datos de nombres, direcciones y teléfonos correctamente', async () => {
    await page.goto('https://www.google.com.ar/maps/search/cafeterias', {
      waitUntil: 'networkidle',
    });

    const data = await extraerDatosActuales(page);

    expect(Array.isArray(data)).toBeTruthy(); // Verifica que data sea un array
    expect(data.length).toBeGreaterThan(0); // Debe contener al menos un resultado

    data.forEach(lugar => {
      expect(lugar).toHaveProperty('nombre');
      expect(lugar).toHaveProperty('direccion');
      expect(lugar).toHaveProperty('numero');
      expect(typeof lugar.nombre).toBe('string');
      expect(typeof lugar.direccion).toBe('string');
      expect(typeof lugar.numero).toBe('string');
    });

    console.log(`✅ Datos extraídos: ${data.length} registros`);
  });
});
