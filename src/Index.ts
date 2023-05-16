// Copyright (c) DAIA Tech Pvt Ltd.
// Licensed under the MIT license.
//
// Entry point for schema specification module

export * from './SchemaInterface';

import { knexDbSpec, typescriptDbInterface } from './generators/DatabaseGenerators';
import { knexMigrationSpec, knexTableMigrationSpec } from './generators/MigrationGenerators';
import * as prettier from 'prettier';
import * as fs from 'fs';
import { DatabaseSpec, TableSpec } from './SchemaInterface';

// Read the formatter config
const prettierconfig: prettier.Options = {
  parser: 'typescript',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 120,
};

const format = (source: string) => prettier.format(source, prettierconfig);

/**
 * Write the database typescript interface into a given file
 * @param dbSpec Database specification
 * @param fileName Path to the file to write the typescript interface
 */
export function writeTypescriptInterfaceFile<T extends string, S extends string, O extends string>(
  dbSpec: DatabaseSpec<T, S, O>,
  customTypePath: string,
  fileName: string
) {
  const data = typescriptDbInterface(dbSpec, customTypePath);
  fs.writeFileSync(fileName, format(data));
}

/**
 * Write the database create table functions into a given file
 * @param dbSpec Database specification
 * @param fileName Path to the destination file
 */
export function writeTableFunctionsFile<T extends string, S extends string, O extends string>(
  dbSpec: DatabaseSpec<T, S, O>,
  knexClientPath: string,
  fileName: string
) {
  const data = knexDbSpec(dbSpec, knexClientPath);
  fs.writeFileSync(fileName, format(data));
}

/**
 * Write the database migration tables functions into a given file
 * @param queryContent queries to be run for migration
 * @param fileName Path to the destination file
 */
export function writeMigrationFile<T extends string, S extends string, O extends string>(
  fileName: string,
  queryContent: string[],
  knexClientPath: string
) {
  const data = knexMigrationSpec(queryContent, knexClientPath);
  fs.writeFileSync(fileName, format(data));
}

/**
 * Write the database migration tables functions into a given file
 * @param intent intent of migration
 * @param fileName Path to the destination file
 * @param queryContent queries to be run for migration
 */
export function writeTableMigrationFile<T extends string, S extends string, O extends string>(
  fileName: string,
  intent: string,
  queryContent: {[key:string]: TableSpec<T, S, O>},
  knexClientPath: string
) {
  const data = knexTableMigrationSpec(intent, queryContent, knexClientPath);
  fs.writeFileSync(fileName, format(data));
}

