import eslintConfigBase from "./eslint.config.base.mjs";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import eslintPluginReact from "eslint-plugin-react";
import {fixupPluginRules} from '@eslint/compat';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...eslintConfigBase,
    pluginReact.configs.flat.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                React: true,
                JSX: true,
            },
        }
    },
    {
        plugins: {
            'react': eslintPluginReact,
            'react-hooks': fixupPluginRules(eslintPluginReactHooks),
        },
    },
    {
        rules: {
            ...eslintPluginReactHooks.configs.recommended.rules,
            '@typescript-eslint/no-non-null-assertion': 'off'
        },
    },

];
