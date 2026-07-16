'use strict'

Command.cases.changeActorMotion = new CommandSchema({
	name: 'changeActorMotion',
	onInitialize() {
		$('#changeActorMotion-confirm').on('click', () => this.save())
		$('#changeActorMotion-type').loadItems([
			{ name: 'Idle', value: 'idle' },
			{ name: 'Move', value: 'move' }
		])
	},
	parseMapping(type, motion) {
		const motionType = Local.get('command.changeActorMotion.type.' + type)
		const motionName = Command.parseEnumString(motion)
		return motionType + Token(' -> ') + motionName
	},
	customParse({ actor, type, motion }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseMapping(type, motion))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorMotion') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ actor = { type: 'trigger' }, type = 'move', motion = '' }) {
		const write = getElementWriter('changeActorMotion')
		write('actor', actor)
		write('type', type)
		write('motion', motion)
		$('#changeActorMotion-actor').getFocus()
	},
	customSave() {
		const read = getElementReader('changeActorMotion')
		const motion = read('motion')
		if (motion === '') {
			return $('#changeActorMotion-motion').getFocus()
		}
		Command.save({
			actor: read('actor'),
			type: read('type'),
			motion
		})
	}
})
