'use strict'

Command.cases.addAnimationComponent = {
	initialize: function () {
		$('#addAnimationComponent-confirm').on('click', this.save)

		// 创建可旋转选项
		$('#addAnimationComponent-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 创建同步角度选项
		$('#addAnimationComponent-syncAngle').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])

		// 侦听动画ID写入事件
		$('#addAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#addAnimationComponent-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	parseRotatable: function (rotatable) {
		return rotatable
			? Local.get('command.addAnimationComponent.rotatable')
			: ''
	},
	parseSyncAngle: function (syncAngle) {
		return syncAngle
			? Local.get('command.addAnimationComponent.syncAngle')
			: ''
	},
	parsePriority: function (priority) {
		if (priority === 0) return ''
		const abs = Command.setNumberColor(Math.abs(priority))
		return priority > 0 ? Token('+') + abs : Token('-') + abs
	},
	parseOffsetY: function (offsetY) {
		if (offsetY === 0) return ''
		const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
		return offsetY > 0 ? abs : Token('-') + abs
	},
	parse: function ({
		actor,
		animationId,
		motion,
		rotatable,
		syncAngle,
		priority,
		offsetY
	}) {
		syncAngle = syncAngle ?? false // 补丁
		offsetY = offsetY ?? 0 // 补丁
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
			.push(this.parseRotatable(rotatable))
			.push(this.parseSyncAngle(syncAngle))
			.push(this.parsePriority(priority))
			.push(this.parseOffsetY(offsetY))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.addAnimationComponent') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		motion = '',
		rotatable = false,
		syncAngle = false,
		priority = 0,
		offsetY = 0
	}) {
		const write = getElementWriter('addAnimationComponent')
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		write('rotatable', rotatable)
		write('syncAngle', syncAngle)
		write('priority', priority)
		write('offsetY', offsetY)
		$('#addAnimationComponent-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('addAnimationComponent')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#addAnimationComponent-animationId').getFocus()
		}
		const motion = read('motion')
		if (motion === '') {
			return $('#addAnimationComponent-motion').getFocus()
		}
		const rotatable = read('rotatable')
		const syncAngle = read('syncAngle')
		const priority = read('priority')
		const offsetY = read('offsetY')
		Command.save({
			actor,
			animationId,
			motion,
			rotatable,
			syncAngle,
			priority,
			offsetY
		})
	}
}
