import { TableSpec } from '../SchemaInterface';
/**
 * Generate the typescript name for a table. Converts given name to pascal case.
 * @param name Name of the table
 * @returns Typescript name for the table
 */
export declare function typescriptTableName(name: string): string;
/**
 * Generate the table template string for the given specs
 * @param templateSpec Spec for the table templates
 */
export declare function tableTemplate<T extends string, S extends string, O extends string>(templateSpec: TableSpec<T, S, O>['templates'] | undefined, includeValues?: boolean): string;
/**
 * Generate the typescript table record spec for a table
 * @param name Name of the table
 * @param spec Spec for the table
 * @param suffix Suffix to be appended to the table type name
 */
export declare function typescriptTableRecordSpec<T extends string, S extends string, O extends string>(name: string, spec: TableSpec<T, S, O>, suffix?: string): string;
/**
 * Generate the knex table specification for a table
 * @param name Name of the table
 * @param spec Spec fot the table
 */
export declare function knexTableSpec<T extends string, S extends string, O extends string>(name: string, spec: TableSpec<T, S, O>): string;
