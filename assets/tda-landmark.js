/* Shared by the terrestrial (MapLibre 4) and aerial (MapLibre 5) maps. */
(function (root) {
  'use strict';
  const location = Object.freeze({ lng: -58.522660, lat: -34.580054, altitude: 0, heading: 0 });

  function createLayer({ THREE, GLTFLoader, maplibregl, modelUrl }) {
    let map, renderer, scene, camera, transform, model;
    let removed = false;
    const projection = new THREE.Matrix4();
    function disposeModel(object) {
      object.traverse(child => {
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(material => material?.dispose());
      });
    }
    return {
      id: 'tda-building-3d',
      type: 'custom',
      renderingMode: '3d',
      onAdd(layerMap, gl) {
        map = layerMap;
        camera = new THREE.Camera();
        scene = new THREE.Scene();
        scene.add(new THREE.HemisphereLight(0xffffff, 0x697269, 2.2));
        const sun = new THREE.DirectionalLight(0xfff5e8, 2.4);
        sun.position.set(-30, 50, 30);
        scene.add(sun);
        const coordinate = maplibregl.MercatorCoordinate.fromLngLat(
          [location.lng, location.lat], location.altitude
        );
        const units = coordinate.meterInMercatorCoordinateUnits();
        // GLB is already in metres, Y up. Convert to the map's Z-up coordinates.
        transform = new THREE.Matrix4()
          .makeTranslation(coordinate.x, coordinate.y, coordinate.z)
          .scale(new THREE.Vector3(units, -units, units))
          .multiply(new THREE.Matrix4().makeRotationZ(location.heading * Math.PI / 180))
          .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
        renderer.autoClear = false;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
        else renderer.outputEncoding = THREE.sRGBEncoding;
        document.documentElement.dataset.tda = 'loading';
        new GLTFLoader().load(modelUrl, gltf => {
          if (removed) { disposeModel(gltf.scene); return; }
          model = gltf.scene;
          model.traverse(object => { object.frustumCulled = false; });
          scene.add(model);
          document.documentElement.dataset.tda = 'loaded';
          map.triggerRepaint();
        }, undefined, error => {
          if (removed) return;
          document.documentElement.dataset.tda = 'error';
          console.error('No se pudo cargar el edificio TDA.', error);
        });
      },
      render(gl, args) {
        if (!model || removed) return;
        const matrix = args.defaultProjectionData?.mainMatrix ?? args;
        camera.projectionMatrix.copy(projection.fromArray(matrix).multiply(transform));
        renderer.resetState();
        renderer.render(scene, camera);
        renderer.resetState();
        // Static landmark: the map schedules camera updates; no perpetual repaint.
      },
      onRemove() {
        removed = true;
        if (model) disposeModel(model);
        renderer?.dispose();
        // The WebGL context belongs to MapLibre; do not forceContextLoss().
      }
    };
  }
  root.TDALandmark = Object.freeze({ location, createLayer });
})(globalThis);
