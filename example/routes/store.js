/**
 * Store routes
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const Router = require('koa-joi-router');

const router = Router();
const t = Router.Joi;

/**
 * Quantity of anything
 */
const Quantity = t
  .number()
  .integer()
  .positive()
  .required()
  .label('Quantity');

/**
 * Order model
 */
const Order = t
  .object()
  .label('Order')
  .keys({
    id: t
      .number()
      .positive()
      .required()
      .description('Some unique ID for order')
      .example(7),
    petId: t
      .number()
      .positive()
      .required()
      .description('ID of pet')
      .example('5'),
    quantity: Quantity,
    shipDate: t
      .date()
      .iso()
      .description('Shipment date'),
    status: t
      .string()
      .valid(['placed', 'approved', 'delivered'])
      .default('placed')
      .description('Status of order'),
    complete: t.boolean().default(false),
  });

router.route({
  method: 'get',
  path: '/inventory',
  meta: {
    friendlyName: 'Store inventory',
    description: 'Returns pet inventories by status',
    extendedDescription: `
         **Implementation notes**
         * Returns a map of status codes to quantities
      `,
  },
  validate: {
    output: {
      200: {
        body: {
          available: Quantity.description('Pets available for sale'),
          pending: Quantity.description('# of pets awaiting processing'),
          sold: Quantity.description('# of pets sold'),
        },
      },
      400: {
        body: {
          code: t
            .number()
            .integer()
            .min(0)
            .max(100)
            .default(0)
            .description('Code to explain the response.'),
          errors: t.object().keys({
            name: {
              message: t
                .string()
                .required()
                .default('Some pet has no name!')
                .description('Thrown when some pets has no name.'),
            },
          }),
          tags: t.array().items(
            t.object().keys({
              label: t
                .string()
                .example('Hello')
                .example('World'),
              signal: t.array().items(t.string()),
            }),
          ),
          error: t
            .string()
            .valid('Pets not found!')
            .description('Pets not found!'),
        },
      },
    },
  },
  handler() {
    // This route does not have any validations
    return this.db()
      .table('store')
      .groupBy('statusCode')
      .map('quantity')
      .run();
  },
});

/**
 * Place an order for a pet
 */
router.route({
  method: 'post',
  path: '/order',
  meta: {
    friendlyName: 'Place an order for a pet',
  },
  validate: {
    type: 'json',
    body: Order,
    output: {
      201: {
        type: 'json',
        body: Order,
      },
    },
  },
  handler() {
    const order = this.request.body;
    this.db()
      .table('orders')
      .insert(order)
      .run();
  },
});

module.exports = router;
