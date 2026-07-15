'use strict'

Command.cases.createTrigger = {
	initialize: function () {
		$('#createTrigger-confirm').on('click', this.save)
	},
	parse: function ({
		triggerId,
		caster,
		origin,
		angle,
		distance,
		scale,
		timeScale
	}) {
		const casterName = Command.parseActor(caster)
		const originName = Command.parsePosition(origin)
		const words = Command.words
			.push(Command.parseVariableFile(triggerId))
			.push(casterName)
			.push(originName.indexOf(casterName) === -1 ? originName : '')
			.push(Command.parseAngle(angle))
			.push(Command.parseVariableNumber(distance, 't'))
			.push(Command.parseVariableNumber(scale))
			.push(Command.parseVariableNumber(timeScale))
		return [
			{ color: 'skill' },
			{ text: Local.get('command.createTrigger') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		triggerId = '',
		caster = { type: 'trigger' },
		origin = { type: 'actor', actor: { type: 'trigger' } },
		angle = { type: 'direction', degrees: 0 },
		distance = 0,
		scale = 1,
		timeScale = 1
	}) {
		const write = getElementWriter('createTrigger')
		write('triggerId', triggerId)
		write('caster', caster)
		write('origin', origin)
		write('angle', angle)
		write('distance', distance)
		write('scale', scale)
		write('timeScale', timeScale)
		$('#createTrigger-triggerId').getFocus()
	},
	save: function () {
		const read = getElementReader('createTrigger')
		const triggerId = read('triggerId')
		if (triggerId === '') {
			return $('#createTrigger-triggerId').getFocus()
		}
		const caster = read('caster')
		const origin = read('origin')
		const angle = read('angle')
		const distance = read('distance')
		const scale = read('scale')
		const timeScale = read('timeScale')
		Command.save({
			triggerId,
			caster,
			origin,
			angle,
			distance,
			scale,
			timeScale
		})
	}
}
