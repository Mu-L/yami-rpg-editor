'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.unloadSubscene = new CommandSchema({
	name: 'unloadSubscene',
	fields: [{ key: 'sceneId', default: '', required: true }],
	customParse({ sceneId }) {
		return [
			{ color: 'scene' },
			{ text: Local.get('command.unloadSubscene') + Token(': ') },
			{ text: Command.parseVariableFile(sceneId) }
		]
	},
	onLoad() {
		$('#unloadSubscene-sceneId').getFocus()
	}
})
