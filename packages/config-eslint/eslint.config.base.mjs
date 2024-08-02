import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-plugin-prettier/recommended";

const tsConfig = /** @type {import("eslint").Linter.Config[]} */ (
    tseslint.configs.strict
);

/** @type {import("eslint").Linter.Config[]} */
export default [
    {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
    {languageOptions: {globals: {...globals.browser, ...globals.node}}},
    pluginJs.configs.recommended,
    ...tsConfig,
    eslintConfigPrettier,
];
