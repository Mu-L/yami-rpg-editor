'use strict'

Command.cases.changeActorMotion = {
	initialize: function () {
		$('#changeActorMotion-confirm').on('click', this.save)

		// 创建动作类型选项
		$('#changeActorMotion-type').loadItems([
			{ name: 'Idle', value: 'idle' },
			{ name: 'Move', value: 'move' }
		])
	},
	parseMapping: function (type, motion) {
		const motionType = Local.get('command.changeActorMotion.type.' + type)
		const motionName = Command.parseEnumString(motion)
		return motionType + Token(' -> ') + motionName
	},
	parse: function ({ actor, type, motion }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseMapping(type, motion))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		type = 'move',
		motion = ''
	}) {
		const write = getElementWriter('changeActorMotion')
		write('actor', actor)
		write('type', type)
		write('motion', motion)
		$('#changeActorMotion-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorMotion')
		const actor = read('actor')
		const type = read('type')
		const motion = read('motion')
		if (motion === '') {
			return $('#changeActorMotion-motion').getFocus()
		}
		Command.save({ actor, type, motion })
	}
}
