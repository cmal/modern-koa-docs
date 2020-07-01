/**
 * Docs generation middleware
 */

const render = require('mithril-node-render');
const tpl = require('./template');

function createMiddleware(route, opts) {
  return async function middleware(ctx, next) {
    // Skip all requests other then a GET request at specified route
    if (ctx.request.method !== 'get' && ctx.request.url.indexOf(route) !== 0) {
      return next();
    }

    ctx.body = await render(tpl(opts));
    return null;
  };
}

module.exports = {
  get: createMiddleware,
};
