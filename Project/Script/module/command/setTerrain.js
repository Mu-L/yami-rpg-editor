'use strict'

Command.cases.setTerrain = {
	initialize: function () {
		$('#setTerrain-confirm').on('click', this.save)
		$('#setTerrain-terrain').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Wall', value: 'wall' }
		])
	},
	parse: function ({ position, terrain }) {
		const words = Command.words
			.push(Command.parsePosition(position))
			.push(Local.get('command.setTerrain.' + terrain))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setTerrain') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		position = { type: 'absolute', x: 0, y: 0 },
		terrain = 'land'
	}) {
		const write = getElementWriter('setTerrain')
		write('position', position)
		write('terrain', terrain)
		$('#setTerrain-position').getFocus()
	},
	save: function () {
		const read = getElementReader('setTerrain')
		const position = read('position')
		const terrain = read('terrain')
		Command.save({ position, terrain })
	}
}
