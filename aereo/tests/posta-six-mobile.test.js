import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');

test('ambos recorridos integran el lector compartido de Posta 6', () => {
  for (const html of ['mobile.html', 'aereo/index.html']) {
    assert.match(read(html), /posta-six-reader\.js/);
    assert.match(read(html), /posta-six-reader\.css/);
  }
  for (const script of ['script.js', 'aereo/app.js']) assert.match(read(script), /PostaSixReader\.mount/);
  const reader = read('assets/posta-six-reader.js');
  assert.match(reader, /Aspectos metodológicos de la investigación/);
  assert.match(reader, /Microrrelatos/);
  assert.match(reader, /positions\[active\]/);
  assert.match(reader, /download\.href = section\.pdf/);
});

test('las 28 páginas de microrrelatos y su PDF se distribuyen localmente', () => {
  for (let page = 1; page <= 28; page++) {
    const path = `assets/microrrelatos/page-${String(page).padStart(2, '0')}.webp`;
    assert.ok(existsSync(new URL(path, root)), path);
  }
  const pdf = readFileSync(new URL('assets/pdfs/Feria_Ciencias_2026_Microrrelato.pdf', root));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
});

test('el encuadre terrestre conserva dimensiones y transformaciones nativas', () => {
  const source = read('script.js');
  assert.match(source, /bus\.style\.width = busConf\.size/);
  assert.match(source, /trainContainer\.style\.width = conf\.size/);
  assert.match(source, /translateY\(-85%\)/);
  assert.match(source, /translateY\(-40%\)/);
  assert.doesNotMatch(source, /compactVehicle/);
  assert.doesNotMatch(source, /pinwheelDiv\.style\.transform\s*=/);
  assert.match(source, /installResponsiveSceneFraming/);
});

test('el encuadre aéreo usa límites proyectados y excluye escritorio', () => {
  const source = read('aereo/app.js');
  assert.match(source, /Box3\(\)\.setFromObject\(airship\)/);
  assert.match(source, /dataset\.experienceMode !== 'desktop'/);
  assert.match(source, /if \(!impactActive\) fitAirshipInMobileViewport/);
  assert.doesNotMatch(source, /compactPortrait \? 0\.85/);
});
