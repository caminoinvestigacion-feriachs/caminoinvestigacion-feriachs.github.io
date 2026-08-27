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
