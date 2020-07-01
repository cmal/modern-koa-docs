/**
 * Example router for pets
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const Router = require('koa-joi-router');

const t = Router.Joi;
const router = Router();

const Category = t
  .object()
  .label('Category')
  .keys({
    id: t.number(),
    name: t.string(),
  });

const Tag = t
  .object()
  .label('Tag')
  .keys({
    id: t
      .number()
      .positive()
      .required()
      .description('ID for tag')
      .example(5),
    name: t
      .string()
      .required()
      .description('Name of tag')
      .example('dogs', 'cats'),
  });

const Pet = t
  .object()
  .label('Pet')
  .keys({
    id: t.number().optional(),
    name: t.string().required(),
    category: Category,
    tags: t.array().items(Tag),
    photoUrls: t
      .array()
      .items(t.string())
      .required(),
    status: t
      .string()
      .valid(['available', 'pending', 'sold'])
      .description('pet status in the store'),
  });

router.route({
  method: 'post',
  path: '/pet',
  meta: {
    friendlyName: 'Add pet',
    description: 'Add a new pet to the store',
  },
  validate: {
    type: 'json',
    body: Pet,
  },
  handler: async ctx => {
    const pet = ctx.request.body;
    ctx.body = pet;
  },
});

router.route({
  method: 'put',
  path: '/pet',
  meta: {
    friendlyName: 'Update pet',
    description: 'Update an existing pet',
  },
  validate: {
    type: 'json',
    body: Pet,
  },
  handler() {
    const pet = this.request.body;
    if (!pet.id) this.throw(400, 'Invalid ID supplied');

    const existing = this.db()
      .get(pet.id)
      .run();
    if (!existing) this.throw(404, 'Pet not found');

    return this.db()
      .table('pets')
      .update(pet)
      .run();
  },
});

router.route({
  method: 'put',
  path: '/pet',
  meta: {
    friendlyName: 'Find pets by status',
  },
  validate: {
    type: 'json',
    query: {
      status: t
        .array()
        .description('Status values that need to be considered for filter')
        .items(t.string())
        .min(1) // At least 1 should be provided
        .single(), // If only one is provided, wrap it in an array
    },
    output: {
      200: {
        body: t.array().items(Pet.requiredKeys('id', 'status')),
        header: {
          'Content-Type': t.string(),
        },
      },
    },
  },
  handler() {
    const { query } = this.request;

    return this.db()
      .table('pets')
      .getAll(query.status)
      .run();
  },
});

module.exports = router;
