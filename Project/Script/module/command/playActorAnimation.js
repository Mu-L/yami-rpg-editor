'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.playActorAnimation = new CommandSchema({
	name: 'playActorAnimation',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'motion', default: '', required: true },
		{ key: 'speed', default: 1 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#playActorAnimation-confirm').on('click', () => this.save())
		$('#playActorAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseSpeed(speed) {
		if (speed === 1) return ''
		return Command.parseVariableNumber(speed)
	},
	customParse({ actor, motion, speed, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseEnumString(motion))
			.push(this.parseSpeed(speed))
			.push(Command.parseWait(wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.playActorAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#playActorAnimation-actor').getFocus()
	}
})
