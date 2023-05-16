// Copyright (c) DAIA Tech Pvt Ltd.
// Licensed under the MIT license.
//
// Table level generators.

import camelcase from 'camelcase';
import { TableSpec } from '../SchemaInterface';
import { knexColumnSpec, typescriptColumnSpec, typescriptType } from './ColumnGenerators';

/**
 * Generate the typescript name for a table. Converts given name to pascal case.
 * @param name Name of the table
 * @returns Typescript name for the table
 */
export function typescriptTableName(name: string): string {
  return camelcase(name, { pascalCase: true });
}

/**
 * Generate the table template string for the given specs
 * @param templateSpec Spec for the table templates
 */
export function tableTemplate<T extends string, S extends string, O extends string>(
  templateSpec: TableSpec<T, S, O>['templates'] | undefined,
  includeValues: boolean = true
): string {
  const templateString = templateSpec
    ?.map(([t, d]) => {
      const dt = typescriptType('', [d]);
      return includeValues ? `${t} = ${dt}` : t;
    })
    .join(',');
  return templateString ? `<${templateString}>` : '';
}

/**
 * Generate the typescript table record spec for a table
 * @param name Name of the table
 * @param spec Spec for the table
 * @param suffix Suffix to be appended to the table type name
 */
export function typescriptTableRecordSpec<T extends string, S extends string, O extends string>(
  name: string,
  spec: TableSpec<T, S, O>,
  suffix: string = 'Record'
): string {
  const columns = spec.columns;
  const tsColSpecs = columns.map((column) => typescriptColumnSpec(column));
  const tableType = typescriptTableName(name);
  return `
  export type ${tableType}${suffix} ${tableTemplate(spec.templates)} = {
    ${tsColSpecs.join('\n')}
  }`;
}

/**
 * Generate the knex table specification for a table
 * @param name Name of the table
 * @param spec Spec fot the table
 */
export function knexTableSpec<T extends string, S extends string, O extends string>(
  name: string,
  spec: TableSpec<T, S, O>
): string {
  const columns = spec.columns;
  const knexColSpecs = columns.map((column) => knexColumnSpec(column));
  const tableType = typescriptTableName(name);

  // Hack to associate a field with a sequence
  const sequences =
    spec.sequences?.map((sequence) => {
      const [col_name, init_val] = sequence;
      const commands = [];
      const seq_name = `${name}_${col_name}_seq`;
      commands.push(`CREATE SEQUENCE ${seq_name}`);
      commands.push(`ALTER TABLE ${name} ALTER ${col_name} SET DEFAULT nextval('${seq_name}')`);
      if (init_val != undefined) {
        commands.push(`SELECT SETVAL('${seq_name}', ${init_val})`);
}
      return commands.map((c) => `await knex.raw(\`${c};\`);`).join('\n');
    }) || [];

  const triggers = spec.triggers?.map((trigger) => `await knex.raw(\`${trigger}\`)`) || [];

  // Indices
  const indices = spec.indices?.map((columns) => `table.index(${JSON.stringify(columns)})`) || [];

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

export function knexAddTableSpec<T extends string, S extends string, O extends string>(
  name: string,
  spec: TableSpec<T, S, O>
): string {
  const columns = spec.columns;
  const knexColSpecs = columns.map((column) => knexColumnSpec(column));
  const tableType = typescriptTableName(name);
  const triggers = spec.triggers?.map((trigger) => `await knex.raw(\`${trigger}\`)`) || [];
  return `
  export async function create${tableType}Table() {
    await knex.schema.createTable('${name}', async (table) => {
      ${knexColSpecs.join('\n')}
    });
    ${triggers.join('\n')}
  }`;
}

export function knexDropTableSpec<T extends string, S extends string, O extends string>(
  name: string,
  spec: TableSpec<T, S, O>
): string {
  const tableType = typescriptTableName(name);
  return  `export async function drop${tableType}Table() {
    await knex.raw('DROP TABLE IF EXISTS ${name} CASCADE')
  }`;
}
