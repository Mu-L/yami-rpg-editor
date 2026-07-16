'use strict'

Command.cases.removeAnimationComponent = new CommandSchema({
	name: 'removeAnimationComponent',
	onInitialize() {
		$('#removeAnimationComponent-confirm').on('click', () => this.save())
		$('#removeAnimationComponent-animationId').on('write', (event) => {
			const elMotion = $('#removeAnimationComponent-motion')
			elMotion.loadItems(Animation.getMotionListItems(event.value))
			elMotion.write2(elMotion.read())
		})
	},
	customParse({ actor, animationId, motion }) {
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
	customLoad({ actor = { type: 'trigger' }, animationId = '', motion = '' }) {
		var write = getElementWriter('removeAnimationComponent')
		write('actor', actor)
		write('animationId', animationId)
		write('motion', motion)
		$('#removeAnimationComponent-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('removeAnimationComponent')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#removeAnimationComponent-animationId').getFocus()
		}
		const motion = read('motion')
		if (motion === '') {
			return $('#removeAnimationComponent-motion').getFocus()
		}
		Command.save({
			actor: read('actor'),
			animationId,
			motion
		})
	}
})
