'use strict'

Command.cases.removeAnimationComponent = {
	initialize: function () {
		$('#removeAnimationComponent-confirm').on('click', this.save)

		// 侦听动画ID写入事件
		$('#removeAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#removeAnimationComponent-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	parse: function ({ actor, animationId, motion }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseEnumString(motion))
		return [
			{ color: 'actor' },
			{
				text:
					Local.get('command.removeAnimationComponent') + Token(': ')
			},
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		motion = ''
	}) {
		var write = getElementWriter('removeAnimationComponent')
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		$('#removeAnimationComponent-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('removeAnimationComponent')
		const actor = read('actor')
		const animationId = read('animationId')
		const motion = read('motion')
		if (animationId === '') {
			return $('#removeAnimationComponent-animationId').getFocus()
		}
		if (motion === '') {
			return $('#removeAnimationComponent-motion').getFocus()
		}
		Command.save({ actor, animationId, motion })
	}
}
