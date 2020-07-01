/**
 * Render route params
 */
/* eslint-disable no-underscore-dangle */

// FIXME: main problem in this file!

const m = require('mithril');
const get = require('lodash/get');

const collapsablePanel = require('./collapsable-panel');

/**
 * Capitalize string
 *
 * @param {String} v - any string
 */
const capitalize = v => v.slice(0, 1).toUpperCase() + v.slice(1);

function isArray(schema) {
  return schema._type === 'array';
}

function getItems(schema) {
  if (!isArray(schema)) return [schema];
  return get(schema, '_inner.items', []);
}

function itemLabel(schema) {
  const type = schema._type || schema.constructor.name;
  const flags = schema._flags || {};
  const label = get(schema, '_flags.label', false);
  const repr = label || capitalize(type);

  return repr + (flags.default ? ` = ${flags.default}` : '');
}

function arrayLabel(schema) {
  if (!isArray(schema)) return '';
  const items = getItems(schema).map(itemLabel);
  return `Array [ ${items} ]`;
}

function paramsHeader(schema, type, validations, outputLabel, status) {
  const bodyType = validations.type;
  const label = isArray(schema) ? arrayLabel(schema) : itemLabel(schema);

  const header = [
    capitalize(type),
    outputLabel ? `[${outputLabel}]` : '',
    !label ? '' : `: ${label}`,
  ];

  // In case of body also indicate what type of body is expected
  // i.e. json, form, multipart
  if (type === 'body' || type === 'multipartOptions') {
    const tag = { style: { float: 'right' } };
    const bodyTag = m('span.label.label-info', tag, bodyType);
    header.push(bodyTag);
  } else if (type === 'output') {
    const outputTag = m(
      'span.label.label-info',
      { style: { float: 'left', marginRight: '10px' } },
      status,
    );
    header.push(outputTag);
  }

  return header;
}

/**
 * Rendering params string
 *
 * @param {Object} schema - Schema // TODO: write good description
 * @param {Object} field  - Field // TODO: write good description
 */
function paramsRow(schema, field) {
  const flags = schema._flags || {};
  const required = flags && flags.presence === 'required';
  const optional = flags && flags.presence === 'optional';
  const valids = Array.from(schema._valids._set);
  const invalids = Array.from(schema._invalids._set).filter(
    v => v !== '' && v !== Infinity && v !== -Infinity,
  );
  const tests = schema._tests;
  let type = schema._type;
  if (type === 'alternatives') {
    const schemas = get(schema, '_inner.matches', []);
    type = schemas.map(s => s.schema._type).join(' | ');
  }

  // bold for required
  const renderFieldType = () => {
    const text = `${type}${isArray(schema) ? '[]' : ''}`;
    if (required) {
      return m('strong', text);
    }
    return text;
  };

  const renderTests = () => {
    const text =
      tests.length > 0
        ? ` ${tests
            .map(test => {
              const testArg = test.arg !== undefined ? test.arg : '';
              const testArgStr = testArg === '' ? '' : `(${testArg})`;
              return `${test.name}${testArgStr}`;
            })
            .join(',')}`
        : '';
    return text !== '' ? `(${text.trim()})` : '';
  };
  return m('tr', [
    m('td', optional ? '否' : '是'),
    m('td', field + (flags.default !== undefined ? ` = ${flags.default}` : '')),
    m('td', [
      renderFieldType(),
      renderTests(),
      valids.length > 0 ? ` in [${valids}]` : '',
      valids.length > 0 && invalids.length > 0 ? ' and ' : '',
      invalids.length > 0 ? ` not in [${invalids}]` : '',
    ]),
    m('td', schema._examples.map(v => v.value).join(' | ')),
    m('td', schema._description || {}),
  ]);
}

/**
 * Recursive schema runs
 *
 * @param {Jbject} schema
 * @param {String} key
 */
function traversingSchema(schema, key) {
  const result = [];
  if (key) {
    result.push(paramsRow(schema, key));
  }

  if (schema.isJoi) {
    if (schema._type === 'object') {
      const children = get(schema, '_inner.children', []);
      if (children) {
        children.forEach(child => {
          result.push(...traversingSchema(child.schema, key ? `${key}.${child.key}` : child.key));
        });
      }
    } else if (isArray(schema)) {
      const items = get(schema, '_inner.items', []);
      if (items) {
        items.forEach(item => {
          result.push(...traversingSchema(item, `${key}[]`));
        });
      }
    }
  } else if (typeof schema === 'object') {
    Object.keys(schema).forEach(k => {
      result.push(...traversingSchema(schema[k], key ? `${key}.${k}` : k));
    });
  } else {
    // schema is wrong
    throw new Error(`schema is invalid with key: ${key}, got ${JSON.stringify(schema)}`);
  }
  return result;
}

function paramsTableBody(schema) {
  const body = m('tbody');

  // TODO: sort validations by required

  body.children = traversingSchema(schema);

  body.children.unshift(
    m('tr', [
      m('th', 'Required?'),
      m('th', 'Key = default'),
      m('th', 'Type (tests) in [valids] not in [invalids]'),
      m('th', 'Examples'),
      m('th', 'Description'),
    ]),
  );

  return body;
}

function paramsTable(validations, type, label, status) {
  // eslint-disable-next-line no-prototype-builtins
  if (!validations || !validations.hasOwnProperty(type)) {
    return [];
  }

  let schema = validations[type];

  if (label && status) {
    schema = schema[status][label];
  }

  const heading = paramsHeader(schema, type, validations, label, status);

  const table = {
    style: { marginBottom: 0 },
  };

  const panel = {
    className: type === 'output' ? 'panel-primary' : '',
  };

  return collapsablePanel(heading, panel, [
    m('table.table.table-striped', table, [
      m.trust(`
            <colgroup>
               <col span="1" style="width: 5%;">
               <col span="1" style="width: 15%;">
               <col span="1" style="width: 25%;">
               <col span="1" style="width: 15%;">
               <col span="1" style="width: 40%;">
            </colgroup>
         `),

      getItems(schema).map(paramsTableBody),
    ]),
  ]);
}

/**
 * Render validations table
 *
 * @param {Object} validations - validation rules
 */
function outputTable(validations) {
  // eslint-disable-next-line no-prototype-builtins
  if (!validations || !validations.hasOwnProperty('output')) return [];
  const ret = [];
  Object.keys(validations.output).forEach(status => {
    if (validations.output[status].body)
      ret.push(paramsTable(validations, 'output', 'body', status));
    if (validations.output[status].header)
      ret.push(paramsTable(validations, 'output', 'header', status));
  });
  return ret;
}

module.exports = function routeParams(route) {
  return [
    paramsTable(route.validate, 'header'),
    paramsTable(route.validate, 'query'),
    paramsTable(route.validate, 'params'),
    paramsTable(route.validate, 'body'),
    paramsTable(route.validate, 'multipartOptions'),
    ...outputTable(route.validate),
  ];
};
