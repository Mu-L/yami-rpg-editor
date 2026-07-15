'use strict'

Command.cases.setTile = {
	initialize: function () {
		$('#setTile-confirm').on('click', this.save)
	},
	parse: function ({
		tilemap,
		tilemapX,
		tilemapY,
		tilesetId,
		tilesetX,
		tilesetY
	}) {
		const words = Command.words
			.push(Command.parseTilemap(tilemap))
			.push(Command.parseVariableNumber(tilemapX))
			.push(Command.parseVariableNumber(tilemapY))
			.push(Command.parseFileName(tilesetId))
			.push(Command.parseVariableNumber(tilesetX))
			.push(Command.parseVariableNumber(tilesetY))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setTile') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		tilemap = { type: 'trigger' },
		tilemapX = 0,
		tilemapY = 0,
		tilesetId = '',
		tilesetX = 0,
		tilesetY = 0
	}) {
		const write = getElementWriter('setTile')
		write('tilemap', tilemap)
		write('tilemapX', tilemapX)
		write('tilemapY', tilemapY)
		write('tilesetId', tilesetId)
		write('tilesetX', tilesetX)
		write('tilesetY', tilesetY)
		$('#setTile-tilemap').getFocus()
	},
	save: function () {
		const read = getElementReader('setTile')
		const tilemap = read('tilemap')
		const tilemapX = read('tilemapX')
		const tilemapY = read('tilemapY')
		const tilesetId = read('tilesetId')
		const tilesetX = read('tilesetX')
		const tilesetY = read('tilesetY')
		if (tilesetId === '') {
			return $('#setTile-tilesetId').getFocus()
		}
		Command.save({
			tilemap,
			tilemapX,
			tilemapY,
			tilesetId,
			tilesetX,
			tilesetY
		})
	}
}
