'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.translateActor = new CommandSchema({
	name: 'translateActor',
	onInitialize() {
		$('#translateActor-confirm').on('click', () => this.save())
		$('#translateActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#translateActor').on('open', function (event) {
			$('#translateActor-easingId').loadItems(Data.createEasingItems())
		})
		$('#translateActor').on('closed', function (event) {
			$('#translateActor-easingId').clear()
		})
	},
	customParse({ actor, angle, distance, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseAngle(angle))
			.push(Command.parseVariableNumber(distance, 't'))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.translateActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		actor = { type: 'trigger' },
		angle = { type: 'absolute', degrees: 0 },
		distance = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('translateActor')
		write('actor', actor)
		write('angle', angle)
		write('distance', distance)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#translateActor-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('translateActor')
		const distance = read('distance')
		if (distance === 0) {
			return $('#translateActor-distance').getFocus('all')
		}
		Command.save({
			actor: read('actor'),
			angle: read('angle'),
			distance,
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		})
	}
})
