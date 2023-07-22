"use strict";
// Copyright (c) DAIA Tech Pvt Ltd.
// Licensed under the MIT license.
//
// Column level generators.
Object.defineProperty(exports, "__esModule", { value: true });
exports.knexColumnSpec = exports.basicKnexField = exports.typescriptColumnSpec = exports.typescriptType = void 0;
/**
 * Return the typescript type for a specific column
 * @param ctype Table column type
 * @param name Name of the column
 */
function typescriptType(name, ctype) {
    switch (ctype[0]) {
        case 'bigserial':
            return 'string';
        case 'bigint':
            return 'string';
        case 'int':
            return 'number';
        case 'float':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'string':
            return ctype[2] ? `Custom.${ctype[2]}` : 'string';
        case 'text':
            return 'string';
        case 'timestamp':
            return 'string';
        case '>':
            return 'string';
        case 'stringarray':
            return `{ ${name}: string[] }`;
        case 'kv':
            return '{ [id: string]: string | number | boolean | string[] }';
        case 'stringdict':
            return '{ [id: string]: string }';
        case 'object': {
            const objType = ctype[1];
            const templates = ctype[2];
            if (!objType)
                return 'object';
            const templateString = templates ? `<${templates.join(',')}>` : '';
            return `Custom.${objType} ${templateString}`;
        }
        case 'template':
            return ctype[1];
        default:
            ((obj) => {
                throw new Error(`Invalid column type '${obj}'`);
            })(ctype[0]);
    }
}
exports.typescriptType = typescriptType;
/**
 * Generate typescript definition for a column given a spec
 * @param spec Specification of the column
 */
function typescriptColumnSpec(spec) {
    const name = spec[0];
    const ctype = spec[1];
    const nullable = spec[3];
    const tsType = typescriptType(name, ctype);
    return nullable == 'nullable' ? `${name}: ${tsType} | null` : `${name}: ${tsType}`;
}
exports.typescriptColumnSpec = typescriptColumnSpec;
/**
 * Generate the basic knex field spec for a given column
 * @param name Name of the field
 * @param ctype Specification of the column
 */
function basicKnexField(name, ctype) {
    switch (ctype[0]) {
        case 'bigserial':
            return `specificType('${name}', 'BIGSERIAL')`;
        case 'bigint':
            return `bigInteger('${name}')`;
        case 'int': {
            const field = `integer('${name}')`;
            const def = ctype[1];
            return def ? `${field}.defaultTo(${def})` : field;
        }
        case 'float':
            return `float('${name}')`;
        case 'boolean': {
            const field = `boolean('${name}')`;
            const def = ctype[1];
            return def == undefined ? field : def ? `${field}.defaultTo(true)` : `${field}.defaultTo(false)`;
        }
        case 'string': {
            const len = ctype[1];
            return `specificType('${name}', 'VARCHAR(${len})')`;
        }
        case 'text':
            return `text('${name}')`;
        case 'timestamp': {
            const now = 'knex.fn.now()';
            const eon = new Date(0).toISOString();
            const field = `timestamp('${name}')`;
            const def = ctype[1];
            return def ? (def == 'eon' ? `${field}.defaultTo('${eon}')` : `${field}.defaultTo(${now})`) : field;
        }
        case '>':
            return `bigInteger('${name}')`;
        case 'stringarray':
            return `json('${name}').defaultTo('{ "${name}": [] }')`;
        case 'kv':
            return `json('${name}')`;
        case 'stringdict':
            return `json('${name}')`;
        case 'object':
            return `json('${name}')`;
        case 'template':
            return `json('${name}')`;
        default:
            ((obj) => {
                throw new Error(`Invalid column type '${obj}'`);
            })(ctype[0]);
    }
}
exports.basicKnexField = basicKnexField;
/**
 * Generates knex column generation statement for a column with a given spec.
 * @param spec Specification of the column
 */
function knexColumnSpec(spec) {
    const [name, ctype, unique, nullable, mutable, shouldIndex] = spec;
    let field = `table.${basicKnexField(name, ctype)}`;
    // 'id' field is always primary
    if (name == 'id') {
        return `${field}.primary()`;
    }
    if (unique === 'unique')
        field += '.unique()';
    if (nullable === 'not nullable')
        field += '.notNullable()';
    if (shouldIndex)
        field += '.index()';
    return field;
}
exports.knexColumnSpec = knexColumnSpec;
//# sourceMappingURL=ColumnGenerators.js.map