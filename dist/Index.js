"use strict";
// Copyright (c) DAIA Tech Pvt Ltd.
// Licensed under the MIT license.
//
// Entry point for schema specification module
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeTableFunctionsFile = exports.writeTypescriptInterfaceFile = void 0;
__exportStar(require("./SchemaInterface"), exports);
const DatabaseGenerators_1 = require("./generators/DatabaseGenerators");
const prettier = __importStar(require("prettier"));
const fs = __importStar(require("fs"));
// Read the formatter config
const prettierconfig = {
    parser: 'typescript',
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    useTabs: false,
    printWidth: 120,
};
const format = (source) => prettier.format(source, prettierconfig);
/**
 * Write the database typescript interface into a given file
 * @param dbSpec Database specification
 * @param fileName Path to the file to write the typescript interface
 */
function writeTypescriptInterfaceFile(dbSpec, customTypePath, fileName) {
    const data = (0, DatabaseGenerators_1.typescriptDbInterface)(dbSpec, customTypePath);
    fs.writeFileSync(fileName, format(data));
}
exports.writeTypescriptInterfaceFile = writeTypescriptInterfaceFile;
/**
 * Write the database create table functions into a given file
 * @param dbSpec Database specification
 * @param fileName Path to the destination file
 */
function writeTableFunctionsFile(dbSpec, knexClientPath, fileName) {
    const data = (0, DatabaseGenerators_1.knexDbSpec)(dbSpec, knexClientPath);
    fs.writeFileSync(fileName, format(data));
}
exports.writeTableFunctionsFile = writeTableFunctionsFile;
//# sourceMappingURL=Index.js.map