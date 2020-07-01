/**
 * Component for sidebar rendering
 */

// TODO Test it

const m = require('mithril');
const anchor = require('./anchor');

function sidebarLink(route) {
  const meta = route.meta || {};
  const display = meta.friendlyName || `${route.method} ${route.path}`;
  const href = `#${anchor(route)}`;
  return m('li', m('a', { href }, display));
}

/**
 * Render routes group
 *
 * @param {Object} group - group declaration
 */
function sidebarGroup(group) {
  return m('ul.nav.nav-sidebar', [
    m.trust(`<lh><strong>${group.groupName}</strong></lh>`),
    group.routes.map(v => sidebarLink(v)),
  ]);
}

/**
 * Render sidebar
 *
 * @param {Object} opts - route groups.
 */
const sidebar = opts => m('nav.sidebar', opts.groups.map(v => sidebarGroup(v)));

module.exports = sidebar;
