import { DatabaseSpec } from "../SchemaInterface";
/**
 * Generate the typescript table interfaces for the entire database.
 * @param spec Full database specification
 * @param customTypePath Path to the file that defines the custom object/string types
 */
export declare function typescriptDbInterface<T extends string, S extends string, O extends string>(spec: DatabaseSpec<T, S, O>, customTypePath: string): string;
/**
 * Generate the table functions for all the tables
 * @param spec Full database specification
 */
export declare function knexDbSpec<T extends string, S extends string, O extends string>(spec: DatabaseSpec<T, S, O>, knexClientPath: string): string;
/**
 * Generate function for creating randomized data for each table.
 * @param spec Full database specification
 * @param tableInterfacesPath Path to the file that defines the custom object/string types
 */
export declare function fakeDataGenerators<T extends string, S extends string, O extends string>(spec: DatabaseSpec<T, S, O>, tableInterfacesPath: string, customTypePath: string): string;
