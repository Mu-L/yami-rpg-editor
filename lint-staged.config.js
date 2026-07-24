/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
module.exports = {
	'*.{js,ts,css}': ['oxfmt -c ./.oxfmtrc.json --write'],
	'*.{js,ts}': ['oxlint -c ./.oxlintrc.json --fix']
};
