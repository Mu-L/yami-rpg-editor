'use strict'

Command.cases.moveActor = {
	initialize: function () {
		$('#moveActor-confirm').on('click', this.save)

		// 创建移动模式选项
		$('#moveActor-mode').loadItems([
			{ name: 'Stop', value: 'stop' },
			{ name: 'Keep', value: 'keep' },
			{ name: 'Straight', value: 'straight' },
			{ name: 'Navigate', value: 'navigate' },
			{ name: 'Navigate - Bypass Actors', value: 'navigate-bypass' },
			{ name: 'Teleport', value: 'teleport' }
		])

		// 设置移动模式关联元素
		$('#moveActor-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'keep', targets: [$('#moveActor-angle')] },
				{
					case: ['straight', 'navigate', 'navigate-bypass'],
					targets: [$('#moveActor-destination'), $('#moveActor-wait')]
				},
				{ case: 'teleport', targets: [$('#moveActor-destination')] }
			])

		// 创建等待结束选项
		$('#moveActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseMode: function (mode) {
		let string = Local.get('command.moveActor.mode.' + mode)
		if (mode === 'navigate-bypass') {
			string = string.replace('(', Token('(')).replace(')', Token(')'))
		}
		return string
	},
	parse: function ({ actor, mode, angle, destination, wait }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseMode(mode))
		switch (mode) {
			case 'stop':
				break
			case 'keep':
				words.push(Command.parseVariableNumber(angle, '°'))
				break
			case 'straight':
			case 'navigate':
			case 'navigate-bypass':
				words.push(Command.parsePosition(destination))
				words.push(Command.parseWait(wait))
				break
			case 'teleport':
				words.push(Command.parsePosition(destination))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.moveActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		mode = 'straight',
		angle = 0,
		destination = { type: 'absolute', x: 0, y: 0 },
		wait = false
	}) {
		const write = getElementWriter('moveActor')
		write('actor', actor)
		write('mode', mode)
		write('angle', angle)
		write('destination', destination)
		write('wait', wait)
		$('#moveActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('moveActor')
		const actor = read('actor')
		const mode = read('mode')
		switch (mode) {
			case 'stop':
				Command.save({ actor, mode })
				break
			case 'keep': {
				const angle = read('angle')
				Command.save({ actor, mode, angle })
				break
			}
			case 'straight':
			case 'navigate':
			case 'navigate-bypass': {
				const destination = read('destination')
				const wait = read('wait')
				Command.save({ actor, mode, destination, wait })
				break
			}
			case 'teleport': {
				const destination = read('destination')
				Command.save({ actor, mode, destination })
				break
			}
		}
	}
}
