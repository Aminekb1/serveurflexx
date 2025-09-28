// frontend_react/app/test-setup.js
// Polyfill TextEncoder/TextDecoder pour Jest (Node < 18)
// Si util.TextEncoder n'existe pas, fallback sur fast-text-encoding
try {
  const util = require('util');
  if (typeof global.TextEncoder === 'undefined' && util && util.TextEncoder) {
    global.TextEncoder = util.TextEncoder;
  }
  if (typeof global.TextDecoder === 'undefined' && util && util.TextDecoder) {
    global.TextDecoder = util.TextDecoder;
  }
} catch (err) {
  // fallback : installer et require 'fast-text-encoding' si util ne fournit pas TextEncoder
  // npm install -D fast-text-encoding
  try {
    require('fast-text-encoding'); // this will add TextEncoder/TextDecoder globals
  } catch (e) {
    // si tout échoue, on laisse Jest lever l'erreur ultérieurement
    // console.warn('fast-text-encoding not installed and util.TextEncoder not available');
  }
}
