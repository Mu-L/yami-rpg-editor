import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.changeActorAnimation = new CommandSchema({
	name: 'changeActorAnimation',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true }
	],
	customParse({ actor, animationId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#changeActorAnimation-actor').getFocus()
	}
})
