'use strict'

Command.cases.addAnimationComponent = new CommandSchema({
	name: 'addAnimationComponent',
	onInitialize() {
		$('#addAnimationComponent-confirm').on('click', () => this.save())
		$('#addAnimationComponent-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#addAnimationComponent-syncAngle').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#addAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#addAnimationComponent-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	parseRotatable(rotatable) {
		return rotatable
			? Local.get('command.addAnimationComponent.rotatable')
			: ''
	},
	parseSyncAngle(syncAngle) {
		return syncAngle
			? Local.get('command.addAnimationComponent.syncAngle')
			: ''
	},
	parsePriority(priority) {
		if (priority === 0) return ''
		const abs = Command.setNumberColor(Math.abs(priority))
		return priority > 0 ? Token('+') + abs : Token('-') + abs
	},
	parseOffsetY(offsetY) {
		if (offsetY === 0) return ''
		const abs = Command.setNumberColor(Math.abs(offsetY)) + 'px'
		return offsetY > 0 ? abs : Token('-') + abs
	},
	customParse({
		actor,
		animationId,
		motion,
		rotatable,
		syncAngle,
		priority,
		offsetY
	}) {
		syncAngle = syncAngle ?? false
		offsetY = offsetY ?? 0
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
	customLoad({
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
	customSave() {
		const read = getElementReader('addAnimationComponent')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#addAnimationComponent-animationId').getFocus()
		}
		const motion = read('motion')
		if (motion === '') {
			return $('#addAnimationComponent-motion').getFocus()
		}
		Command.save({
			actor: read('actor'),
			animationId,
			motion,
			rotatable: read('rotatable'),
			syncAngle: read('syncAngle'),
			priority: read('priority'),
			offsetY: read('offsetY')
		})
	}
})
