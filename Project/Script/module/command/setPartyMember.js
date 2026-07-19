import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setPartyMember = new CommandSchema({
	name: 'setPartyMember',
	fields: [
		{ key: 'operation', default: 'add' },
		{ key: 'actor', default: { type: 'trigger' } }
	],
	onInitialize() {
		$('#setPartyMember-confirm').on('click', () => this.save())
		$('#setPartyMember-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' }
		])
	},
	customParse({ operation, actor }) {
		const words = Command.words
			.push(Local.get('command.setPartyMember.' + operation))
			.push(Command.parseActor(actor))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setPartyMember') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setPartyMember-operation').getFocus()
	}
})
