module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: [
		'plugin:prettier/recommended',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js'],
	rules: {
		'@typescript-eslint/no-extraneous-class': 'off',
		'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
		'@typescript-eslint/array-type': ['error', { default: 'generic', readonly: 'generic' }],
		'@typescript-eslint/prefer-readonly': 'error',
	},
};
