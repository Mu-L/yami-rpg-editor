import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.waitForVideo = new CommandSchema({
	name: 'waitForVideo',
	fields: [
		{ key: 'element', domId: 'element', default: { type: 'trigger' } }
	],
	customParse({ element }) {
		return [
			{ color: 'element' },
			{ text: Local.get('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		]
	},
	onLoad() {
		$('#waitForVideo-element').getFocus()
	}
})
