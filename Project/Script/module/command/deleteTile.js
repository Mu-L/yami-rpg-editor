'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.deleteTile = new CommandSchema({
	name: 'deleteTile',
	fields: [
		{ key: 'tilemap', default: { type: 'trigger' } },
		{ key: 'tilemapX', default: 0 },
		{ key: 'tilemapY', default: 0 }
	],
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
	onLoad() {
		$('#deleteTile-tilemap').getFocus()
	}
})
