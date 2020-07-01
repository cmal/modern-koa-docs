/**
 * Cacl hash for page anchors
 */

const hasha = require('hasha');

module.exports = function anchor(route) {
  return hasha(`${route.method.join('')}-${route.path}-${route.handler}`).slice(0, 12);
};
