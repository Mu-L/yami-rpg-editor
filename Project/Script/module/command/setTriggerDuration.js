import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setTriggerDuration = new CommandSchema({
	name: 'setTriggerDuration',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'operation', default: 'set' },
		{ key: 'duration', default: 0 }
	],
	onInitialize() {
		$('#setTriggerDuration-confirm').on('click', () => this.save())
		$('#setTriggerDuration-operation').loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' }
		])
	},
	customParse({ trigger, operation, duration }) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Local.get('command.setTriggerDuration.' + operation))
			.push(Command.parseVariableNumber(duration, 'ms'))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerDuration') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setTriggerDuration-trigger').getFocus()
	}
})
