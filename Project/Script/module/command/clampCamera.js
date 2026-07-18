'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.clampCamera = new CommandSchema({
	name: 'clampCamera',
	fields: [
		{ key: 'left', default: 0 },
		{ key: 'top', default: 0 },
		{ key: 'right', default: 0 },
		{ key: 'bottom', default: 0 }
	],
	customParse({ left, top, right, bottom }) {
		const words = Command.words
			.push(
				Local.get('command.clampCamera.left') +
					Token(' = ') +
					Command.parseVariableNumber(left)
			)
			.push(
				Local.get('command.clampCamera.top') +
					Token(' = ') +
					Command.parseVariableNumber(top)
			)
			.push(
				Local.get('command.clampCamera.right') +
					Token(' = ') +
					Command.parseVariableNumber(right)
			)
			.push(
				Local.get('command.clampCamera.bottom') +
					Token(' = ') +
					Command.parseVariableNumber(bottom)
			)
		return [
			{ color: 'scene' },
			{ text: Local.get('command.clampCamera') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#clampCamera-left').getFocus('all')
	}
})
