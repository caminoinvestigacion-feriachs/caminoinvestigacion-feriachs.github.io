# Camino de la investigación — Feria CHS

Publicación autocontenida preparada para GitHub Pages en:

`https://caminoinvestigacion-feriachs.github.io/`

La raíz contiene el portal y el recorrido terrestre. El recorrido aéreo está
incluido en `aereo/`, por lo que la navegación completa permanece dentro del
mismo dominio.

## Verificación local

Servir siempre desde la raíz del repositorio:

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000/`. No abrir los HTML directamente mediante
`file://`, porque los mapas cargan datos con `fetch()`.

## Publicación

El workflow de GitHub Actions ubicado en `.github/workflows/pages.yml` publica
la raíz completa al hacer push a `main`.

## Edificio TDA en ambos recorridos

La capa compartida `assets/tda-landmark.js` coloca el exterior del TDA en
longitud -58.522660, latitud -34.580054, a nivel del terreno. El archivo
`assets/models/tda/tda-exterior.glb` conserva materiales y geometría detallada
(50.212 triángulos, aproximadamente 3 MB). Está en metros, con Y vertical;
la capa lo convierte a las coordenadas de MapLibre 4 y 5, sin ampliar su escala.

La geometría es una reconstrucción aproximada desde fotografías. La orientación
es provisional (0 grados) y los supuestos se conservan en `metadata.json`.
La misma ubicación y el mismo asset se usan en terrestre y aéreo. La capa
terrestre se repone si se reconstruye el estilo por el fallback de teselas.
