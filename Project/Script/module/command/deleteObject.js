import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.deleteObject = new CommandSchema({
	name: 'deleteObject',
	fields: [{ key: 'object', domId: 'object', default: { type: 'trigger' } }],
	customParse({ object }) {
		return [
			{ color: 'object' },
			{ text: Local.get('command.deleteObject') + Token(': ') },
			{ text: Command.parseObject(object) }
		]
	},
	onLoad() {
		$('#deleteObject-object').getFocus()
	}
})
