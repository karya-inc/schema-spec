// Copyright (c) DAIA Tech Pvt Ltd.
// Licensed under the MIT license.
//
// Column level generators.

import { TableColumnSpec, TableColumnType } from "../SchemaInterface";

/**
 * Return the typescript type for a specific column
 * @param ctype Table column type
 * @param name Name of the column
 */
export function typescriptType<
  T extends string,
  S extends string,
  O extends string
>(name: string, ctype: TableColumnType<T, S, O>): string {
  switch (ctype[0]) {
    case "bigserial":
      return "string";
    case "bigint":
      return "string";
    case "int":
      return "number";
    case "float":
      return "number";
    case "boolean":
      return "boolean";
    case "string":
      return ctype[2] ? `Custom.${ctype[2]}` : "string";
    case "text":
      return "string";
    case "timestamp":
      return "string";
    case ">":
      return "string";
    case "stringarray":
      return `{ ${name}: string[] }`;
    case "kv":
      return "{ [id: string]: any }";
    case "stringdict":
      return "{ [id: string]: string }";
    case "object": {
      const objType = ctype[1];
      const templates = ctype[2];
      if (!objType) return "object";
      const templateString = templates ? `<${templates.join(",")}>` : "";
      return `Custom.${objType} ${templateString}`;
    }
    case "template":
      return ctype[1];
    default:
      ((obj: never) => {
        throw new Error(`Invalid column type '${obj}'`);
      })(ctype[0]);
  }
}

/**
 * Code to generate a fake string for a given column name
 * that satisfies the length requirement of varchar
 *
 * @param columnName Name of the column
 * @param length Hint for the length of the string to be generated.
 */
function fakerGeneratorForString(columnName: string, length: number) {
  if (columnName.includes("id")) {
    return `faker.string.uuid().replace(/-/g, '').slice(0, ${length})`;
  }
  if (columnName.includes("email")) {
    return "faker.internet.email()";
  }
  if (columnName.includes("phone")) {
    return `faker.phone.number({style: 'international'})`;
  }
  if (columnName.includes("access_code")) {
    return `faker.string.numeric(${Math.min(8, length)})`;
  }
  if (columnName.includes("url")) {
    return "faker.internet.url()";
  }
  return `faker.string.words({min: 3, max: ${length}})`;
}

/**
 * Code to generate a fake value for a column based on its type.
 * @param columnName Name of the column
 * @param ctype Type of the column
 * @param nullable Whether the column is nullable. Gives nullable fields a 50% chance of being null.
 *
 * @returns A string with the code to generate a fake value for the column.
 */
export function fakedColumnValue<
  T extends string,
  S extends string,
  O extends string
>(
  columnName: string,
  ctype: TableColumnType<T, S, O>,
  nullable: boolean
): string {
  let fakedValue: string;
  switch (ctype[0]) {
    case "bigserial":
    case "bigint":
    case ">":
      fakedValue = "faker.number.bigInt()";
      break;
    case "int":
      fakedValue = "faker.number.int()";
      break;
    case "float":
      fakedValue = "faker.number.float()";
      break;
    case "boolean":
      fakedValue = "faker.datatype.boolean()";
      break;
    case "string":
      fakedValue = fakerGeneratorForString(columnName, ctype[1]);
      break;
    case "text":
      fakedValue = "faker.lorem.paragraph()";
      break;
    case "timestamp":
      fakedValue = "faker.date.recent({days: 30}).toISOString()";
      break;
    case "stringarray":
      fakedValue = `{ "${columnName}": faker.helpers.arrayElements(faker.lorem.words(), { min: 1, max: 5 }) }`;
      break;
    case "kv":
    case "stringdict":
    case "object":
      // To generate we take a random workd from lorem as the key
      // and a random string of length 10 as the value.
      fakedValue = `
        Object.fromEntries(
          faker.helpers.arrayElements(
            faker.lorem.words(),
            { min: 1, max: 5 }
          ).map(word => [word, faker.string.alpha()])
        )`;
      break;
    case "template":
      // For templates, we return an empty object as a placeholder
      // since it is not clear what the template should contain.
      //
      // This will fail if the template doesn't extend an object
      fakedValue = `{}`;
      break;
    default:
      ((obj: never) => {
        throw new Error(`Invalid column type '${obj}'`);
      })(ctype[0]);
  }
  if (nullable) {
    return `faker.helpers.maybe(() => (${fakedValue})) ?? null`;
  }
  return fakedValue;
}

/**
 * Generate typescript definition for a column given a spec
 * @param spec Specification of the column
 */
export function typescriptColumnSpec<
  T extends string,
  S extends string,
  O extends string
>(spec: TableColumnSpec<T, S, O>): string {
  const name = spec[0];
  const ctype = spec[1];
  const nullable = spec[3];
  const tsType = typescriptType(name, ctype);
  return nullable == "nullable"
    ? `${name}: ${tsType} | null`
    : `${name}: ${tsType}`;
}

/**
 * Generate the basic knex field spec for a given column
 * @param name Name of the field
 * @param ctype Specification of the column
 */
export function basicKnexField<
  T extends string,
  S extends string,
  O extends string
>(name: string, ctype: TableColumnType<T, S, O>): string {
  switch (ctype[0]) {
    case "bigserial":
      return `specificType('${name}', 'BIGSERIAL')`;

    case "bigint":
      return `bigInteger('${name}')`;

    case "int": {
      const field = `integer('${name}')`;
      const def = ctype[1];
      return def ? `${field}.defaultTo(${def})` : field;
    }

    case "float":
      return `float('${name}')`;

    case "boolean": {
      const field = `boolean('${name}')`;
      const def = ctype[1];
      return def == undefined
        ? field
        : def
        ? `${field}.defaultTo(true)`
        : `${field}.defaultTo(false)`;
    }

    case "string": {
      const len = ctype[1];
      return `specificType('${name}', 'VARCHAR(${len})')`;
    }

    case "text":
      return `text('${name}')`;

    case "timestamp": {
      const now = "knex.fn.now()";
      const eon = new Date(0).toISOString();
      const field = `timestamp('${name}')`;
      const def = ctype[1];
      return def
        ? def == "eon"
          ? `${field}.defaultTo('${eon}')`
          : `${field}.defaultTo(${now})`
        : field;
    }

    case ">":
      return `bigInteger('${name}')`;

    case "stringarray":
      return `jsonb('${name}').defaultTo('{ "${name}": [] }')`;

    case "kv":
      return `jsonb('${name}')`;

    case "stringdict":
      return `jsonb('${name}')`;

    case "object":
      return `jsonb('${name}')`;

    case "template":
      return `jsonb('${name}')`;

    default:
      ((obj: never) => {
        throw new Error(`Invalid column type '${obj}'`);
      })(ctype[0]);
  }
}

/**
 * Generates knex column generation statement for a column with a given spec.
 * @param spec Specification of the column
 */
export function knexColumnSpec<
  T extends string,
  S extends string,
  O extends string
>(spec: TableColumnSpec<T, S, O>): string {
  const [name, ctype, unique, nullable, mutable, shouldIndex] = spec;
  let field = `table.${basicKnexField(name, ctype)}`;

  // 'id' field is always primary
  if (name == "id") {
    return `${field}.primary()`;
  }

  if (unique === "unique") field += ".unique()";
  if (nullable === "not nullable") field += ".notNullable()";
  if (shouldIndex) field += ".index()";
  return field;
}
