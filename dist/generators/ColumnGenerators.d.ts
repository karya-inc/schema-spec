import { TableColumnSpec, TableColumnType } from '../SchemaInterface';
/**
 * Return the typescript type for a specific column
 * @param ctype Table column type
 * @param name Name of the column
 */
export declare function typescriptType<T extends string, S extends string, O extends string>(name: string, ctype: TableColumnType<T, S, O>): string;
/**
 * Generate typescript definition for a column given a spec
 * @param spec Specification of the column
 */
export declare function typescriptColumnSpec<T extends string, S extends string, O extends string>(spec: TableColumnSpec<T, S, O>): string;
/**
 * Generate the basic knex field spec for a given column
 * @param name Name of the field
 * @param ctype Specification of the column
 */
export declare function basicKnexField<T extends string, S extends string, O extends string>(name: string, ctype: TableColumnType<T, S, O>): string;
/**
 * Generates knex column generation statement for a column with a given spec.
 * @param spec Specification of the column
 */
export declare function knexColumnSpec<T extends string, S extends string, O extends string>(spec: TableColumnSpec<T, S, O>): string;
