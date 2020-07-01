/**
 * Test for anchor generator
 *
 * src/components/anchor.js
 */

const anchorGenerator = require('../src/components/anchor');
const petRouter = require('../example/routes/pets');
const storeRouter = require('../example/routes/store');

const petRoutes = petRouter.routes;
const storeRoutes = storeRouter.routes;

it('Test anchor generator on PET', () => {
  expect(anchorGenerator(petRoutes[0])).toBe('a8f91efef5d1');
  expect(anchorGenerator(petRoutes[1])).toBe('9416c39b213f');
  expect(anchorGenerator(petRoutes[2])).toBe('4f22024b07b3');
});

it('Test anchor generator on STRORE', () => {
  expect(anchorGenerator(storeRoutes[0])).toBe('70532c8d383b');
  expect(anchorGenerator(storeRoutes[1])).toBe('0c6f3df72092');
});

it('Synthetic test for anchor generator', () => {
  expect(
    anchorGenerator({
      method: ['get'],
      path: '/test',
      handler: 'some test handler',
    }),
  ).toBe('f85a2716d3bb');
  expect(
    anchorGenerator({
      method: ['put'],
      path: '/test',
      handler: 'some test handler',
    }),
  ).toBe('e6b9ec90c270');
  expect(
    anchorGenerator({
      method: ['post'],
      path: '/test',
      handler: 'some test handler',
    }),
  ).toBe('0bcbae05a701');
});
