import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"warn", // Или 'error', если хотите, чтобы это была ошибка
				{
					argsIgnorePattern: "^_", // Игнорировать аргументы функций, начинающиеся с _
					varsIgnorePattern: "^_", // Игнорировать переменные, начинающиеся с _
					caughtErrorsIgnorePattern: "^_", // Игнорировать ошибки, начинающиеся с _
				},
			],
		},
	},
];

export default eslintConfig;
