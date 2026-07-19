import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.changeActorMotion = new CommandSchema({
	name: 'changeActorMotion',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'type', default: 'move' },
		{ key: 'motion', default: '', required: true }
	],
	onInitialize() {
		$('#changeActorMotion-confirm').on('click', () => this.save())
		$('#changeActorMotion-type').loadItems([
			{ name: 'Idle', value: 'idle' },
			{ name: 'Move', value: 'move' }
		])
	},
	parseMapping(type, motion) {
		const motionType = Local.get('command.changeActorMotion.type.' + type)
		const motionName = Command.parseEnumString(motion)
		return motionType + Token(' -> ') + motionName
	},
	customParse({ actor, type, motion }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseMapping(type, motion))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#changeActorMotion-actor').getFocus()
	}
})
