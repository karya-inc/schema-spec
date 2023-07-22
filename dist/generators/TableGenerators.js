"use strict";
// Copyright (c) DAIA Tech Pvt Ltd.
// Licensed under the MIT license.
//
// Table level generators.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knexTableSpec = exports.typescriptTableRecordSpec = exports.tableTemplate = exports.typescriptTableName = void 0;
const camelcase_1 = __importDefault(require("camelcase"));
const ColumnGenerators_1 = require("./ColumnGenerators");
/**
 * Generate the typescript name for a table. Converts given name to pascal case.
 * @param name Name of the table
 * @returns Typescript name for the table
 */
function typescriptTableName(name) {
    return (0, camelcase_1.default)(name, { pascalCase: true });
}
exports.typescriptTableName = typescriptTableName;
/**
 * Generate the table template string for the given specs
 * @param templateSpec Spec for the table templates
 */
function tableTemplate(templateSpec, includeValues = true) {
    const templateString = templateSpec === null || templateSpec === void 0 ? void 0 : templateSpec.map(([t, d]) => {
        const dt = (0, ColumnGenerators_1.typescriptType)('', [d]);
        return includeValues ? `${t} = ${dt}` : t;
    }).join(',');
    return templateString ? `<${templateString}>` : '';
}
exports.tableTemplate = tableTemplate;
/**
 * Generate the typescript table record spec for a table
 * @param name Name of the table
 * @param spec Spec for the table
 * @param suffix Suffix to be appended to the table type name
 */
function typescriptTableRecordSpec(name, spec, suffix = 'Record') {
    const columns = spec.columns;
    const tsColSpecs = columns.map((column) => (0, ColumnGenerators_1.typescriptColumnSpec)(column));
    const tableType = typescriptTableName(name);
    return `
  export type ${tableType}${suffix} ${tableTemplate(spec.templates)} = {
    ${tsColSpecs.join('\n')}
  }`;
}
exports.typescriptTableRecordSpec = typescriptTableRecordSpec;
/**
 * Generate the knex table specification for a table
 * @param name Name of the table
 * @param spec Spec fot the table
 */
function knexTableSpec(name, spec) {
    var _a, _b, _c;
    const columns = spec.columns;
    const knexColSpecs = columns.map((column) => (0, ColumnGenerators_1.knexColumnSpec)(column));
    const tableType = typescriptTableName(name);
    // Hack to associate a field with a sequence
    const sequences = ((_a = spec.sequences) === null || _a === void 0 ? void 0 : _a.map((sequence) => {
        const [col_name, init_val] = sequence;
        const commands = [];
        const seq_name = `${name}_${col_name}_seq`;
        commands.push(`CREATE SEQUENCE ${seq_name}`);
        commands.push(`ALTER TABLE ${name} ALTER ${col_name} SET DEFAULT nextval('${seq_name}')`);
        if (init_val != undefined) {
            commands.push(`SELECT SETVAL('${seq_name}', ${init_val})`);
        }
        return commands.map((c) => `await knex.raw(\`${c};\`);`).join('\n');
    })) || [];
    const triggers = ((_b = spec.triggers) === null || _b === void 0 ? void 0 : _b.map((trigger) => `await knex.raw(\`${trigger}\`)`)) || [];
    // Indices
    const indices = ((_c = spec.indices) === null || _c === void 0 ? void 0 : _c.map((columns) => `table.index(${JSON.stringify(columns)})`)) || [];
    return `
  export async function create${tableType}Table() {
    await knex.schema.createTable('${name}', async (table) => {
      ${knexColSpecs.join('\n')}
      ${indices.join(`\n`)}
    });
    ${sequences.join('\n')}
    ${triggers.join('\n')}
  }

  export async function drop${tableType}Table() {
    await knex.raw('DROP TABLE IF EXISTS ${name} CASCADE')
  }`;
}
exports.knexTableSpec = knexTableSpec;
//# sourceMappingURL=TableGenerators.js.map