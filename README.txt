CRUCE DE CÓDIGOS POSTALES VS GEOCERCAS
========================================

CÓMO USARLO
-----------
1. Descarga esta carpeta completa (no solo el archivo index.html: las
   subcarpetas "lib" y "data" son necesarias, deben quedar junto al HTML).
2. Abre "index.html" haciendo doble clic (no requiere instalar nada ni
   tener internet: funciona 100% local en el navegador).
3. Sube tu archivo GeoJSON con la(s) geocerca(s). Puede ser:
   - Un FeatureCollection con varias Features (cada una con
     properties.name o properties.nombre para identificarla).
   - Un único Polygon/MultiPolygon.
   - Puedes subir varios archivos a la vez.
4. Pulsa "Calcular cruce". La herramienta detecta automáticamente en qué
   estado(s) de México cae tu geocerca y solo carga los datos de esos
   estados (por eso la carpeta "data" trae los 32 estados: cada corrida
   solo usa los que necesita).
5. Revisa la tabla (filtrable/ordenable), el mapa y exporta a Excel con
   el botón correspondiente.

QUÉ SIGNIFICA CADA COLUMNA
---------------------------
- % en esta geocerca: qué porcentaje del área del CP cae dentro de ESA
  geocerca en particular.
- % total cubierto del CP: suma de lo cubierto por todas las geocercas
  que tocan ese CP (útil si tus zonas son colindantes).
- Estatus del CP (clasificación total):
    * "Completo": una sola geocerca cubre 99.5% o más del CP.
    * "Partido entre geocercas": el CP queda repartido entre DOS O MÁS
      de tus geocercas (esta es la vista clave para saber qué códigos
      postales necesitan coordinación entre rutas/zonas).
    * "Partido (zona incompleta)": una sola geocerca cubre solo una
      parte del CP, y el resto queda fuera de TODAS las geocercas del
      archivo (no es que otra geocerca se lo reparta, simplemente no
      está cubierto del todo).
    * "Marginal": el cruce es menor a 0.5% del área del CP (ruido de
      la simplificación de los polígonos, se ignora por default).
- Geocercas involucradas: lista de geocercas que tocan ese CP (solo se
  llena cuando son 2 o más).

Usa el checkbox "Solo CPs partidos entre geocercas" o el filtro de
clasificación para aislar justo esos casos. También hay una hoja aparte
en el Excel exportado ("Partidos entre geocercas") con ese subconjunto.

FUENTE Y PRECISIÓN DE LOS DATOS
---------------------------------
Los polígonos de código postal provienen de datos abiertos de Correos de
México (SEPOMEX), publicados en datos.gob.mx, procesados y distribuidos
por el proyecto open-mexico/mexico-geojson (MIT license,
https://github.com/open-mexico/mexico-geojson).

Para que el archivo sea manejable en el navegador, los polígonos se
simplificaron (tolerancia ~10 m). Esto introduce una distorsión de área
promedio de ~0.2% por CP (verificado), por lo que los porcentajes son una
muy buena aproximación para decisiones operativas/logísticas, pero NO
deben tratarse como una medición topográfica exacta ni usarse para fines
legales o catastrales.

Nota: SEPOMEX no publica un catálogo oficial de "colonia por CP" cruzado
con estos polígonos, así que la tabla solo identifica el código postal,
no el nombre de colonia.

ESTRUCTURA DE ARCHIVOS
-------------------------
index.html            -> la aplicación (GeoCarga Analyzer)
lib/turf.min.js       -> librería de geometría (Turf.js v6, MIT)
lib/match-core.js     -> lógica de cruce (creado para esta herramienta)
lib/xlsx.full.min.js  -> librería de exportación a Excel (SheetJS, Apache-2.0)
lib/leaflet/           -> librería del mapa interactivo (Leaflet, BSD-2-Clause)
data/manifest.js      -> índice de estados (nombre + bounding box)
data/NN-Estado.js     -> polígonos de CP de cada estado (32 archivos)
assets/movicarga-logo.png -> logo de Movicarga para el encabezado

EDITAR GEOCERCAS Y EXPORTAR KML
---------------------------------
En el panel "2. Editar geocercas" aparece la lista de todas las geocercas
que subiste. Botón "Editar" abre un mapa donde puedes arrastrar los
vértices para reformar el polígono (por ejemplo, para que abarque
completo un código postal que antes quedaba partido). Los CP ya
calculados se muestran de fondo en rosa como referencia visual.

Al guardar, el cambio queda en memoria (no se sube a ningún lado
todavía). Si ya habías calculado el cruce, vuelve a pulsar "Calcular
cruce" para que la tabla y el mapa reflejen la nueva forma.

El botón "Descargar geocercas como KML" exporta TODAS tus geocercas
(con los cambios que hayas hecho) a un archivo .kml listo para subir a
tu plataforma de ruteo, agrupadas en carpetas "Activas"/"Desactivadas"
igual que el KML que se generó antes por separado.

MAPA
-----
El mapa usa un fondo real de calles (OpenStreetMap) que se carga desde
internet al momento de verlo; el cálculo de cruce ya se hizo localmente
y no depende de esto. Rueda del mouse/pellizco = zoom, arrastrar = mover,
clic en un CP = ver el detalle (geocercas + % + estatus). También hay un
buscador de CP arriba del mapa que centra y resalta esa zona.
