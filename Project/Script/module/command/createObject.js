'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.createObject = new CommandSchema({
	name: 'createObject',
	fields: [
		{ key: 'presetId', default: '', required: true },
		{
			key: 'position',
			default: { type: 'actor', actor: { type: 'trigger' } }
		}
	],
	customParse({ presetId, position }) {
		const words = Command.words
			.push(Command.parsePresetObject(presetId))
			.push(Command.parsePosition(position))
		return [
			{ color: 'object' },
			{ text: Local.get('command.createObject') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#createObject-presetId').getFocus()
	}
})
