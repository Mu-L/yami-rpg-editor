import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.wait = new CommandSchema({
	name: 'wait',
	fields: [{ key: 'duration', domId: 'duration', default: 1 }],
	customParse({ duration }) {
		return [
			{ color: 'wait' },
			{ text: Local.get('command.wait') + Token(': ') },
			{ text: Command.parseVariableNumber(duration, 'ms') }
		]
	},
	onLoad() {
		$('#wait-duration').getFocus('all')
	}
})
