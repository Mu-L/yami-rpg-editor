'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.loadSubscene = new CommandSchema({
	name: 'loadSubscene',
	fields: [
		{ key: 'sceneId', default: '', required: true },
		{ key: 'shiftX', default: 0 },
		{ key: 'shiftY', default: 0 }
	],
	customParse({ sceneId, shiftX, shiftY }) {
		const words = Command.words
			.push(Command.parseVariableFile(sceneId))
			.push(Command.parseVariableNumber(shiftX))
			.push(Command.parseVariableNumber(shiftY))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.loadSubscene') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#loadSubscene-sceneId').getFocus()
	}
})
