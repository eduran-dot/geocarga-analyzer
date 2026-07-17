// Núcleo de cálculo: cruce de polígonos de CP contra geocercas.
// Funciona en navegador (usa window.turf) y en Node (require('@turf/turf')), para pruebas.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('@turf/turf'));
  } else {
    root.MatchCore = factory(root.turf);
  }
}(typeof self !== 'undefined' ? self : this, function (turf) {

  var COMPLETE_THRESHOLD = 99.5; // % para considerar un CP "Completo"
  var MARGINAL_THRESHOLD = 0.5;  // % mínimo para reportar un cruce (evita ruido de simplificación)

  function bboxOfGeometry(geometry) {
    return turf.bbox(turf.feature(geometry));
  }

  function bboxOverlap(a, b, pad) {
    pad = pad || 0;
    return !(a[2] + pad < b[0] - pad || b[2] + pad < a[0] - pad ||
             a[3] + pad < b[1] - pad || b[3] + pad < a[1] - pad);
  }

  function prepGeocercas(geocercas) {
    return geocercas.map(function (g) {
      return { name: g.name, geometry: g.geometry, bbox: bboxOfGeometry(g.geometry) };
    });
  }

  // Procesa un CP contra todas las geocercas y acumula en byCp (mutado in place)
  function processCp(cf, geoWithBbox, byCp) {
    var cpFeature = turf.feature(cf.geometry);
    var cpBbox;
    try { cpBbox = turf.bbox(cpFeature); } catch (e) { return; }

    for (var j = 0; j < geoWithBbox.length; j++) {
      var g = geoWithBbox[j];
      if (!bboxOverlap(cpBbox, g.bbox)) continue;

      var gFeature = turf.feature(g.geometry);
      var intersects = false;
      try { intersects = turf.booleanIntersects(cpFeature, gFeature); } catch (e) { continue; }
      if (!intersects) continue;

      var interArea = 0;
      try {
        var inter = turf.intersect(cpFeature, gFeature);
        if (inter) interArea = turf.area(inter);
      } catch (e) {
        continue; // geometría inválida en ese cruce puntual: se ignora
      }
      if (interArea <= 0) continue;

      if (!byCp[cf.cp]) {
        var cpArea = 0;
        try { cpArea = turf.area(cpFeature); } catch (e) { cpArea = 0; }
        byCp[cf.cp] = { cp: cf.cp, estado: cf.estado, cpArea: cpArea, geocercas: {} };
      }
      byCp[cf.cp].geocercas[g.name] = (byCp[cf.cp].geocercas[g.name] || 0) + interArea;
    }
  }

  function finalizeRows(byCp) {
    var rows = [];
    Object.keys(byCp).forEach(function (cp) {
      var rec = byCp[cp];
      if (rec.cpArea <= 0) return;
      var totalCovered = 0;
      var startIdx = rows.length;
      var geoEntries = []; // {name, pct} de geocercas que superan el umbral marginal
      Object.keys(rec.geocercas).forEach(function (gname) {
        var area = Math.min(rec.geocercas[gname], rec.cpArea);
        totalCovered += area;
        var pct = (area / rec.cpArea) * 100;
        if (pct < MARGINAL_THRESHOLD) return;
        geoEntries.push({ name: gname, pct: pct });
        rows.push({
          cp: rec.cp,
          estado: rec.estado,
          geocerca: gname,
          pct: pct,
          clasificacion: pct >= COMPLETE_THRESHOLD ? 'Completo' : 'Partido'
        });
      });
      var totalPct = Math.min(100, (totalCovered / rec.cpArea) * 100);
      var nGeo = geoEntries.length;
      var geoList = geoEntries.map(function (e) { return e.name; }).join(' + ');

      // Clasificación total:
      // - "Partido entre geocercas": el CP queda repartido entre 2+ geocercas del archivo.
      // - "Completo": una sola geocerca cubre (casi) todo el CP.
      // - "Partido (zona incompleta)": una sola geocerca lo cubre solo parcialmente,
      //    y el resto del CP queda fuera de todas las geocercas cargadas.
      // - "Marginal": el cruce es menor al umbral (ruido de simplificación).
      var clasificacionTotal;
      if (nGeo >= 2) {
        clasificacionTotal = 'Partido entre geocercas';
      } else if (totalPct >= COMPLETE_THRESHOLD) {
        clasificacionTotal = 'Completo';
      } else if (totalPct < MARGINAL_THRESHOLD) {
        clasificacionTotal = 'Marginal';
      } else {
        clasificacionTotal = 'Partido (zona incompleta)';
      }

      for (var k = startIdx; k < rows.length; k++) {
        rows[k].pctTotalCp = totalPct;
        rows[k].clasificacionTotal = clasificacionTotal;
        rows[k].nGeocercas = nGeo;
        rows[k].geocercasInvolucradas = geoList;
      }
    });
    rows.sort(function (a, b) {
      if (a.estado !== b.estado) return a.estado < b.estado ? -1 : 1;
      return a.cp - b.cp;
    });
    return rows;
  }

  // Versión síncrona (usada en pruebas Node)
  function computeMatches(geocercas, cpFeatures) {
    var geoWithBbox = prepGeocercas(geocercas);
    var byCp = {};
    for (var i = 0; i < cpFeatures.length; i++) processCp(cpFeatures[i], geoWithBbox, byCp);
    return finalizeRows(byCp);
  }

  // Versión por lotes para navegador: no bloquea el hilo principal
  function computeMatchesChunked(geocercas, cpFeatures, onProgress, onDone, chunkSize) {
    chunkSize = chunkSize || 150;
    var geoWithBbox = prepGeocercas(geocercas);
    var byCp = {};
    var i = 0;
    var total = cpFeatures.length;

    function step() {
      var end = Math.min(i + chunkSize, total);
      for (; i < end; i++) processCp(cpFeatures[i], geoWithBbox, byCp);
      if (onProgress) onProgress(i, total);
      if (i < total) {
        setTimeout(step, 0);
      } else {
        onDone(finalizeRows(byCp));
      }
    }
    setTimeout(step, 0);
  }

  return {
    computeMatches: computeMatches,
    computeMatchesChunked: computeMatchesChunked,
    bboxOfGeometry: bboxOfGeometry,
    bboxOverlap: bboxOverlap,
    COMPLETE_THRESHOLD: COMPLETE_THRESHOLD,
    MARGINAL_THRESHOLD: MARGINAL_THRESHOLD
  };
}));
