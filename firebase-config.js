// ============================================================================
// Configuración de Firebase (modo "web colaborativo")
// ============================================================================
// Este archivo controla si GeoCarga Analyzer trabaja en modo local (offline,
// cada quien con su propio guardado en el navegador — el comportamiento de
// siempre) o en modo colaborativo (varias personas ven y editan las MISMAS
// geocercas, sincronizado casi al instante vía Firebase).
//
// Mientras FIREBASE_CONFIG esté en null, la app funciona 100% offline/local,
// exactamente como antes. Nada de esto se activa ni intenta conectarse a
// internet a menos que lo llenes.
//
// Cómo activarlo:
//   1) Crea un proyecto gratis en https://console.firebase.google.com
//   2) Activa "Authentication" > método "Correo electrónico/contraseña" y
//      crea ahí manualmente las cuentas de las personas que van a usar la
//      herramienta (tú y tu compañero). No hay registro abierto dentro de
//      la app: las cuentas las creas tú desde la consola de Firebase.
//   3) Activa "Firestore Database" (modo producción, cualquier región).
//   4) En la configuración del proyecto (ícono de engrane > "Configuración
//      del proyecto"), en la sección "Tus apps", agrega una app web y copia
//      el objeto de configuración que te da Firebase aquí abajo.
//   5) Pega también las reglas de seguridad del archivo firestore.rules en
//      la consola de Firebase (Firestore Database > Reglas).
//
// Ve WEB_SETUP.md para la guía completa paso a paso.
// ============================================================================

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAb7PDo_PdgoPzgRp6hak0163kOqj-dAw4",
  authDomain: "geocarga-1fb0a.firebaseapp.com",
  projectId: "geocarga-1fb0a",
  storageBucket: "geocarga-1fb0a.firebasestorage.app",
  messagingSenderId: "88177433849",
  appId: "1:88177433849:web:0881d55147975a81f51628"
};

// Ejemplo de cómo se ve una vez lleno (reemplaza con tus valores reales,
// los que copiaste de la consola de Firebase):
//
// w