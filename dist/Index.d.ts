export * from './SchemaInterface';
import { DatabaseSpec } from './SchemaInterface';
/**
 * Write the database typescript interface into a given file
 * @param dbSpec Database specification
 * @param fileName Path to the file to write the typescript interface
 */
export declare function writeTypescriptInterfaceFile<T extends string, S extends string, O extends string>(dbSpec: DatabaseSpec<T, S, O>, customTypePath: string, fileName: string): void;
/**
 * Write the database create table functions into a given file
 * @param dbSpec Database specification
 * @param fileName Path to the destination file
 */
export declare function writeTableFunctionsFile<T extends string, S extends string, O extends string>(dbSpec: DatabaseSpec<T, S, O>, knexClientPath: string, fileName: string): void;
