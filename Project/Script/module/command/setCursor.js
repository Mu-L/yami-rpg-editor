import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setCursor = new CommandSchema({
	name: 'setCursor',
	fields: [{ key: 'image', default: '' }],
	customParse({ image }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.setCursor') + Token(': ') },
			{ text: Command.parseFileName(image) }
		]
	},
	onLoad() {
		$('#setCursor-image').getFocus()
	}
})
