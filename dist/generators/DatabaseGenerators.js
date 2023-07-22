"use strict";
// Copyright (c) DAIA Tech Pvt Ltd.
// Licensed under the MIT license.
//
// Database level generators.
Object.defineProperty(exports, "__esModule", { value: true });
exports.knexDbSpec = exports.typescriptDbInterface = void 0;
const TableGenerators_1 = require("./TableGenerators");
/**
 * Generate the typescript table interfaces for the entire database.
 * @param spec Full database specification
 * @param customTypePath Path to the file that defines the custom object/string types
 */
function typescriptDbInterface(spec, customTypePath) {
    const tables = spec.tables;
    const tableNames = Object.keys(tables);
    // Table record types
    const tsTablesSpec = tableNames.map((name) => {
        const tableSpec = tables[name];
        return (0, TableGenerators_1.typescriptTableRecordSpec)(name, tableSpec);
    });
    // Table object types
    const tableObjectTypes = tableNames.map((name) => {
        const tableSpec = tables[name];
        const template = (0, TableGenerators_1.tableTemplate)(tableSpec.templates);
        const templateWoValues = (0, TableGenerators_1.tableTemplate)(tableSpec.templates, false);
        const tsTableName = (0, TableGenerators_1.typescriptTableName)(name);
        return `export type ${tsTableName} ${template} = Partial<${tsTableName}Record ${templateWoValues}> `;
    });
    // Db record map
    const tableRecordMap = tableNames.map((name) => {
        const tsTableName = (0, TableGenerators_1.typescriptTableName)(name);
        return `T extends '${name}' ? ${tsTableName}Record `;
    });
    // Db object map
    const tableObjectMap = tableNames.map((name) => {
        const tsTableName = (0, TableGenerators_1.typescriptTableName)(name);
        return `T extends '${name}' ? ${tsTableName} `;
    });
    return `
  import * as Custom from '${customTypePath}';

  // Table record type interfaces
  ${tsTablesSpec.join('\n')}

  // Table object types
  ${tableObjectTypes.join('\n')}

  // Table name type
  export type DbTableName = '${tableNames.join(`'|'`)}';

  // Db record map
  export type DbRecordType<T extends DbTableName> = ${tableRecordMap.join(':')} : never;

  // Db object map
  export type DbObjectType<T extends DbTableName> = ${tableObjectMap.join(':')} : never;
  `;
}
exports.typescriptDbInterface = typescriptDbInterface;
/**
 * Generate the table functions for all the tables
 * @param spec Full database specification
 */
function knexDbSpec(spec, knexClientPath) {
    var _a, _b;
    // Create DB level functions
    const dbFunctions = ((_a = spec.functions) === null || _a === void 0 ? void 0 : _a.map(([name, body]) => {
        return `async function create${name}Function() {
      return knex.raw(\`${body}\`)
    }`;
    })) || [];
    const dbFunctionCalls = ((_b = spec.functions) === null || _b === void 0 ? void 0 : _b.map(([name, body]) => {
        return `await create${name}Function()`;
    })) || [];
    const tables = spec.tables;
    const knexTableSpecs = Object.keys(tables).map((name) => {
        const tableSpec = tables[name];
        return (0, TableGenerators_1.knexTableSpec)(name, tableSpec);
    });
    const createTableCalls = Object.keys(tables).map((name) => {
        const tsTableName = (0, TableGenerators_1.typescriptTableName)(name);
        return `await create${tsTableName}Table()`;
    });
    const dropTableCalls = Object.keys(tables).map((name) => {
        const tsTableName = (0, TableGenerators_1.typescriptTableName)(name);
        return `await drop${tsTableName}Table()`;
    });
    return `
  import { knex } from '${knexClientPath}';

  // Db level functions
  ${dbFunctions.join('\n')}

  // Table functions
  ${knexTableSpecs.join('\n')}

  // Create all tables
  export async function createAllTables() {
    ${dbFunctionCalls.join('\n')}
    ${createTableCalls.join('\n')}
  }

  // Drop all tables
  export async function dropAllTables() {
    ${dropTableCalls.join('\n')}
  }
  `;
}
exports.knexDbSpec = knexDbSpec;
//# sourceMappingURL=DatabaseGenerators.js.map