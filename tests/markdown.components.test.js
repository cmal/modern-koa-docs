/**
 * Basic test for markdown renderer
 *
 * Renderer use for descriptions render and no need specific test - just work
 */

const render = require('../src/components/markdown');

it('Markdown renderer test', () => {
  expect(render('')).toBe('');
  expect(render('# My markdown').trim()).toBe('<h1 id="my-markdown">My markdown</h1>');
});
