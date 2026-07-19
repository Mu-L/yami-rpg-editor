import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.simulateKey = new CommandSchema({
	name: 'simulateKey',
	fields: [
		{ key: 'operation', default: 'click' },
		{ key: 'keycode', default: '' }
	],
	onInitialize() {
		$('#simulateKey-confirm').on('click', () => this.save())
		$('#simulateKey-operation').loadItems([
			{ name: 'Click', value: 'click' },
			{ name: 'Press', value: 'press' },
			{ name: 'Release', value: 'release' }
		])
	},
	customParse({ operation, keycode }) {
		const words = Command.words
			.push(Local.get('command.simulateKey.' + operation))
			.push(Command.setStringColor(keycode))
		return [
			{ color: 'system' },
			{ text: Local.get('command.simulateKey') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#simulateKey-operation').getFocus()
	}
})
