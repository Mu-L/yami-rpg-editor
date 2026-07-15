'use strict'

Command.cases.deleteTile = {
	initialize: function () {
		$('#deleteTile-confirm').on('click', this.save)
	},
	parse: function ({ tilemap, tilemapX, tilemapY }) {
		const words = Command.words
			.push(Command.parseTilemap(tilemap))
			.push(Command.parseVariableNumber(tilemapX))
			.push(Command.parseVariableNumber(tilemapY))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.deleteTile') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		tilemap = { type: 'trigger' },
		tilemapX = 0,
		tilemapY = 0
	}) {
		const write = getElementWriter('deleteTile')
		write('tilemap', tilemap)
		write('tilemapX', tilemapX)
		write('tilemapY', tilemapY)
		$('#deleteTile-tilemap').getFocus()
	},
	save: function () {
		const read = getElementReader('deleteTile')
		const tilemap = read('tilemap')
		const tilemapX = read('tilemapX')
		const tilemapY = read('tilemapY')
		Command.save({ tilemap, tilemapX, tilemapY })
	}
}
