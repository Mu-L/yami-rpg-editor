/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
module.exports = {
	'*.{js,css}': [
		'prettier --write --config .prettierrc.json --ignore-path .prettierignore',
		'git add -u'
	]
}
