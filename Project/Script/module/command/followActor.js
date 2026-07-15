'use strict'

Command.cases.followActor = {
	initialize: function () {
		$('#followActor-confirm').on('click', this.save)

		// 创建模式选项
		$('#followActor-mode').loadItems([
			{ name: 'Circle', value: 'circle' },
			{ name: 'Rectangle', value: 'rectangle' }
		])

		// 设置模式关联元素
		$('#followActor-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'circle', targets: [$('#followActor-offset')] },
				{ case: 'rectangle', targets: [$('#followActor-vertDist')] }
			])

		// 创建导航选项
		$('#followActor-navigate').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 设置导航关联元素
		$('#followActor-navigate')
			.enableHiddenMode()
			.relate([{ case: true, targets: [$('#followActor-bypass')] }])

		// 创建绕过角色选项
		$('#followActor-bypass').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建跟随一次选项
		$('#followActor-once').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 设置跟随一次关联元素
		$('#followActor-once')
			.enableHiddenMode()
			.relate([{ case: true, targets: [$('#followActor-wait')] }])

		// 创建等待选项
		$('#followActor-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parseActors: function (actor, target) {
		const sActor = Command.parseActor(actor)
		const dActor = Command.parseActor(target)
		return sActor + Token(' -> ') + dActor
	},
	parse: function ({
		actor,
		target,
		mode,
		minDist,
		maxDist,
		offset,
		vertDist,
		bufferDist,
		navigate,
		bypass,
		once,
		wait
	}) {
		// 2025.3.5补丁
		if (bufferDist === undefined) {
			bufferDist = 0
		}
		const words = Command.words
			.push(this.parseActors(actor, target))
			.push(Local.get('command.followActor.mode.' + mode))
			.push(
				Command.parseVariableNumber(minDist) +
					Token(' ~ ') +
					Command.parseVariableNumber(maxDist)
			)
		switch (mode) {
			case 'circle':
				words.push(Command.setNumberColor(offset.toString()))
				break
			case 'rectangle':
				words.push(Command.setNumberColor(vertDist.toString()))
				break
		}
		words.push(Command.setNumberColor(bufferDist.toString()))
		if (navigate) {
			words.push(Local.get('command.followActor.navigate'))
			if (bypass) {
				words.push(Local.get('command.followActor.bypass'))
			}
		}
		if (once) {
			words.push(Local.get('command.followActor.once'))
			words.push(Command.parseWait(wait))
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.followActor') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		target = { type: 'trigger' },
		mode = 'circle',
		minDist = 1,
		maxDist = 2,
		offset = 0,
		vertDist = 0,
		bufferDist = 0,
		navigate = true,
		bypass = false,
		once = false,
		wait = false
	}) {
		const write = getElementWriter('followActor')
		write('actor', actor)
		write('target', target)
		write('mode', mode)
		write('minDist', minDist)
		write('maxDist', maxDist)
		write('offset', offset)
		write('vertDist', vertDist)
		write('bufferDist', bufferDist)
		write('navigate', navigate)
		write('bypass', bypass)
		write('once', once)
		write('wait', wait)
		$('#followActor-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('followActor')
		const actor = read('actor')
		const target = read('target')
		const mode = read('mode')
		const minDist = read('minDist')
		const maxDist = read('maxDist')
		const bufferDist = read('bufferDist')
		const navigate = read('navigate')
		const bypass = navigate ? { bypass: read('bypass') } : {}
		const once = read('once')
		const wait = once ? read('wait') : false
		switch (mode) {
			case 'circle': {
				const offset = read('offset')
				Command.save({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					offset,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				})
				break
			}
			case 'rectangle': {
				const vertDist = read('vertDist')
				Command.save({
					actor,
					target,
					mode,
					minDist,
					maxDist,
					vertDist,
					bufferDist,
					navigate,
					...bypass,
					once,
					wait
				})
				break
			}
		}
	}
}
