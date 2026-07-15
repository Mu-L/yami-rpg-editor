'use strict'

Command.cases.setObjectAnimation = {
	initialize: function () {
		$('#setObjectAnimation-confirm').on('click', this.save)

		// 创建分类选项
		$('#setObjectAnimation-sort').loadItems([
			{ name: 'Only Actor Animation', value: 'actor' },
			{ name: 'All Animation Components', value: 'components' },
			{ name: 'Trigger Animation', value: 'trigger' },
			{ name: 'Scene Animation', value: 'animation' }
		])

		// 设置动画关联元素
		$('#setObjectAnimation-sort')
			.enableHiddenMode()
			.relate([
				{
					case: ['actor', 'components'],
					targets: [$('#setObjectAnimation-actor')]
				},
				{
					case: 'trigger',
					targets: [$('#setObjectAnimation-trigger')]
				},
				{
					case: 'animation',
					targets: [$('#setObjectAnimation-animation')]
				}
			])

		// 创建操作选项
		$('#setObjectAnimation-operation').loadItems([
			{ name: 'Set Tint', value: 'set-tint' },
			{ name: 'Set RGB', value: 'set-rgb' },
			{ name: 'Set Gray', value: 'set-gray' },
			{ name: 'Set Opacity', value: 'set-opacity' },
			{ name: 'Set OffsetY', value: 'set-offsetY' },
			{ name: 'Set Rotation', value: 'set-rotation' }
		])

		// 设置操作关联元素
		$('#setObjectAnimation-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'set-tint',
					targets: [
						$('#setObjectAnimation-tint-0'),
						$('#setObjectAnimation-tint-1'),
						$('#setObjectAnimation-tint-2'),
						$('#setObjectAnimation-tint-3')
					]
				},
				{
					case: 'set-rgb',
					targets: [
						$('#setObjectAnimation-tint-0'),
						$('#setObjectAnimation-tint-1'),
						$('#setObjectAnimation-tint-2')
					]
				},
				{
					case: 'set-gray',
					targets: [$('#setObjectAnimation-tint-3')]
				},
				{
					case: 'set-opacity',
					targets: [$('#setObjectAnimation-opacity')]
				},
				{
					case: 'set-offsetY',
					targets: [$('#setObjectAnimation-offsetY')]
				},
				{
					case: 'set-rotation',
					targets: [$('#setObjectAnimation-rotation')]
				}
			])

		// 创建等待结束选项
		$('#setObjectAnimation-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建过渡方式选项 - 窗口打开事件
		$('#setObjectAnimation').on('open', function (event) {
			$('#setObjectAnimation-easingId').loadItems(
				Data.createEasingItems()
			)
		})

		// 清理内存 - 窗口已关闭事件
		$('#setObjectAnimation').on('closed', function (event) {
			$('#setObjectAnimation-easingId').clear()
		})
	},
	parseTint: function (operation, [red, green, blue, gray]) {
		const label = Local.get('command.setObjectAnimation.' + operation)
		const _red = Command.setNumberColor(red)
		const _green = Command.setNumberColor(green)
		const _blue = Command.setNumberColor(blue)
		const _gray = Command.setNumberColor(gray)
		switch (operation) {
			case 'set-tint':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(', ') +
					_gray +
					Token(')')
				)
			case 'set-rgb':
				return (
					label +
					Token('(') +
					_red +
					Token(', ') +
					_green +
					Token(', ') +
					_blue +
					Token(')')
				)
			case 'set-gray':
				return label + Token('(') + _gray + Token(')')
		}
	},
	parseProperty: function (operation, property) {
		const label = Local.get('command.setObjectAnimation.' + operation)
		return (
			label +
			Token('(') +
			Command.parseVariableNumber(property) +
			Token(')')
		)
	},
	parse: function ({
		sort,
		object,
		operation,
		tint,
		opacity,
		offsetY,
		rotation,
		easingId,
		duration,
		wait
	}) {
		const words = Command.words
		words.push(Local.get('command.setObjectAnimation.sort.' + sort))
		switch (sort) {
			case 'actor':
			case 'components':
				words.push(Command.parseActor(object))
				break
			case 'trigger':
				words.push(Command.parseTrigger(object))
				break
			case 'animation':
				words.push(Command.parseObject(object))
				break
		}
		switch (operation) {
			case 'set-tint':
			case 'set-rgb':
			case 'set-gray':
				words.push(this.parseTint(operation, tint))
				break
			case 'set-opacity':
				words.push(this.parseProperty(operation, opacity))
				break
			case 'set-offsetY':
				words.push(this.parseProperty(operation, offsetY))
				break
			case 'set-rotation':
				words.push(this.parseProperty(operation, rotation))
				break
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'object' },
			{ text: Local.get('command.setObjectAnimation') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		sort = 'actor',
		object = { type: 'trigger' },
		operation = 'set-tint',
		tint = [0, 0, 0, 0],
		opacity = 1,
		offsetY = 0,
		rotation = 0,
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('setObjectAnimation')
		let actor = { type: 'trigger' }
		let trigger = { type: 'trigger' }
		let animation = { type: 'trigger' }
		switch (sort) {
			case 'actor':
			case 'components':
				actor = object
				break
			case 'trigger':
				trigger = object
				break
			case 'animation':
				animation = object
				break
		}
		write('sort', sort)
		write('actor', actor)
		write('trigger', trigger)
		write('animation', animation)
		write('operation', operation)
		write('tint-0', tint[0])
		write('tint-1', tint[1])
		write('tint-2', tint[2])
		write('tint-3', tint[3])
		write('opacity', opacity)
		write('offsetY', offsetY)
		write('rotation', rotation)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#setObjectAnimation-sort').getFocus()
	},
	save: function () {
		const read = getElementReader('setObjectAnimation')
		const sort = read('sort')
		const operation = read('operation')
		let object
		let red = read('tint-0')
		let green = read('tint-1')
		let blue = read('tint-2')
		let gray = read('tint-3')
		switch (sort) {
			case 'actor':
			case 'components':
				object = read('actor')
				break
			case 'trigger':
				object = read('trigger')
				break
			case 'animation':
				object = read('animation')
				break
		}
		switch (operation) {
			case 'set-tint':
				break
			case 'set-rgb':
				gray = 0
				break
			case 'set-gray':
				red = 0
				green = 0
				blue = 0
				break
		}
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		if ('set-tint|set-rgb|set-gray'.includes(operation)) {
			const tint = [red, green, blue, gray]
			Command.save({
				sort,
				object,
				operation,
				tint,
				easingId,
				duration,
				wait
			})
		} else if (operation === 'set-opacity') {
			const opacity = read('opacity')
			Command.save({
				sort,
				object,
				operation,
				opacity,
				easingId,
				duration,
				wait
			})
		} else if (operation === 'set-offsetY') {
			const offsetY = read('offsetY')
			Command.save({
				sort,
				object,
				operation,
				offsetY,
				easingId,
				duration,
				wait
			})
		} else if (operation === 'set-rotation') {
			const rotation = read('rotation')
			Command.save({
				sort,
				object,
				operation,
				rotation,
				easingId,
				duration,
				wait
			})
		}
	}
}
