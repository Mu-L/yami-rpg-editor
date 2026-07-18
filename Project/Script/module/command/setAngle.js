'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setAngle = new CommandSchema({
	name: 'setAngle',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setAngle-confirm').on('click', () => this.save())
		$('#setAngle-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setAngle').on('open', function (event) {
			$('#setAngle-easingId').loadItems(Data.createEasingItems())
		})
		$('#setAngle').on('closed', function (event) {
			$('#setAngle-easingId').clear()
		})
	},
	customParse({ actor, angle, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseAngle(angle))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setAngle') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setAngle-actor').getFocus()
	}
})
