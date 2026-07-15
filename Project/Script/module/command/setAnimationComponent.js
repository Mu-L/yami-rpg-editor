'use strict'

Command.cases.setAnimationComponent = {
	initialize: function () {
		$('#setAnimationComponent-confirm').on('click', this.save)

		// 创建操作选项
		;($('#setAnimationComponent-operation').loadItems([
			{ name: 'Set Angle', value: 'set-angle' },
			{ name: 'Set Scale', value: 'set-scale' },
			{ name: 'Set Speed', value: 'set-speed' },
			{ name: 'Set Opacity', value: 'set-opacity' },
			{ name: 'Set Priority', value: 'set-priority' },
			{ name: 'Set Offset Y', value: 'set-offsetY' },
			{ name: 'Set Sprite', value: 'set-sprite' },
			{ name: 'Play Motion', value: 'play-motion' },
			{ name: 'Stop Motion', value: 'stop-motion' }
		]),
			// 关联操作相关元素
			$('#setAnimationComponent-operation')
				.enableHiddenMode()
				.relate([
					{
						case: 'set-angle',
						targets: [$('#setAnimationComponent-angle')]
					},
					{
						case: 'set-scale',
						targets: [$('#setAnimationComponent-scale')]
					},
					{
						case: 'set-speed',
						targets: [$('#setAnimationComponent-speed')]
					},
					{
						case: 'set-opacity',
						targets: [$('#setAnimationComponent-opacity')]
					},
					{
						case: 'set-priority',
						targets: [$('#setAnimationComponent-priority')]
					},
					{
						case: 'set-offsetY',
						targets: [$('#setAnimationComponent-offsetY')]
					},
					{
						case: 'set-sprite',
						targets: [
							$('#setAnimationComponent-spriteId'),
							$('#setAnimationComponent-image')
						]
					},
					{
						case: 'play-motion',
						targets: [
							$('#setAnimationComponent-playMotion'),
							$('#setAnimationComponent-wait')
						]
					}
				]))

		// 创建等待选项
		$('#setAnimationComponent-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 侦听动画ID写入事件
		$('#setAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#setAnimationComponent-motion')
			const elPlayMotion = $('#setAnimationComponent-playMotion')
			const elSpriteId = $('#setAnimationComponent-spriteId')
			const motionItems = Animation.getMotionListItems(event.value)
			const spriteItems = Animation.getSpriteListItems(event.value)
			elMotion.loadItems(motionItems)
			elPlayMotion.loadItems(motionItems)
			elSpriteId.loadItems(spriteItems)
			elMotion.write2(elMotion.read())
			elPlayMotion.write2(elPlayMotion.read())
			elSpriteId.write2(elSpriteId.read())
		})
	},
	parsePriority: function (priority) {
		const abs = Command.setNumberColor(Math.abs(priority))
		return priority === 0
			? abs
			: priority > 0
				? Token('+') + abs
				: Token('-') + abs
	},
	parseOffsetY: function (offsetY) {
		const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
		return offsetY >= 0 ? abs : Token('-') + abs
	},
	parse: function ({
		actor,
		animationId,
		motion,
		operation,
		angle,
		scale,
		speed,
		opacity,
		priority,
		offsetY,
		spriteId,
		image,
		playMotion,
		wait
	}) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
			.push(Local.get('command.setAnimationComponent.' + operation))
		switch (operation) {
			case 'set-angle':
				words.push(Command.parseAngle(angle))
				break
			case 'set-scale':
				words.push(Command.parseVariableNumber(scale))
				break
			case 'set-speed':
				words.push(Command.parseVariableNumber(speed))
				break
			case 'set-opacity':
				words.push(Command.parseVariableNumber(opacity))
				break
			case 'set-priority':
				words.push(this.parsePriority(priority))
				break
			case 'set-offsetY':
				words.push(this.parseOffsetY(offsetY))
				break
			case 'set-sprite':
				words.push(Command.parseSpriteName(animationId, spriteId))
				words.push(Command.parseFileName(image))
				break
			case 'play-motion':
				words.push(Command.parseEnumString(playMotion))
				words.push(Command.parseWait(wait))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.setAnimationComponent') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		motion = '',
		operation = 'set-angle',
		angle = { type: 'absolute', degrees: 0 },
		scale = 1,
		speed = 1,
		opacity = 1,
		priority = 0,
		offsetY = 0,
		spriteId = '',
		image = '',
		playMotion = '',
		wait = false
	}) {
		var write = getElementWriter('setAnimationComponent')
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		write('operation', operation)
		write('angle', angle)
		write('scale', scale)
		write('speed', speed)
		write('opacity', opacity)
		write('priority', priority)
		write('offsetY', offsetY)
		write('spriteId', spriteId)
		write('image', image)
		write('wait', wait)
		if (playMotion) write('playMotion', playMotion)
		$('#setAnimationComponent-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setAnimationComponent')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#setAnimationComponent-animationId').getFocus()
		}
		const motion = read('motion')
		if (motion === '') {
			return $('#setAnimationComponent-motion').getFocus()
		}
		const operation = read('operation')
		switch (operation) {
			case 'set-angle': {
				const angle = read('angle')
				Command.save({ actor, animationId, motion, operation, angle })
				break
			}
			case 'set-scale': {
				const scale = read('scale')
				Command.save({ actor, animationId, motion, operation, scale })
				break
			}
			case 'set-speed': {
				const speed = read('speed')
				Command.save({ actor, animationId, motion, operation, speed })
				break
			}
			case 'set-opacity': {
				const opacity = read('opacity')
				Command.save({ actor, animationId, motion, operation, opacity })
				break
			}
			case 'set-priority': {
				const priority = read('priority')
				Command.save({
					actor,
					animationId,
					motion,
					operation,
					priority
				})
				break
			}
			case 'set-offsetY':
				const offsetY = read('offsetY')
				Command.save({ actor, animationId, motion, operation, offsetY })
				break
			case 'set-sprite': {
				const spriteId = read('spriteId')
				const image = read('image')
				if (spriteId === '') {
					return $('#setAnimationComponent-spriteId').getFocus()
				}
				Command.save({
					actor,
					animationId,
					motion,
					operation,
					spriteId,
					image
				})
				break
			}
			case 'play-motion': {
				const playMotion = read('playMotion')
				if (playMotion === '') {
					return $('#setAnimationComponent-playMotion').getFocus()
				}
				const wait = read('wait')
				Command.save({
					actor,
					animationId,
					motion,
					operation,
					playMotion,
					wait
				})
				break
			}
			case 'stop-motion':
				Command.save({ actor, animationId, motion, operation })
				break
		}
	}
}
