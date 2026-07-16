'use strict'

Command.cases.deleteTile = new CommandSchema({
	name: 'deleteTile',
	customParse({ tilemap, tilemapX, tilemapY }) {
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
	customLoad({ tilemap = { type: 'trigger' }, tilemapX = 0, tilemapY = 0 }) {
		const write = getElementWriter('deleteTile')
		write('tilemap', tilemap)
		write('tilemapX', tilemapX)
		write('tilemapY', tilemapY)
		$('#deleteTile-tilemap').getFocus()
	},
	customSave() {
		const read = getElementReader('deleteTile')
		Command.save({
			tilemap: read('tilemap'),
			tilemapX: read('tilemapX'),
			tilemapY: read('tilemapY')
		})
	}
})
