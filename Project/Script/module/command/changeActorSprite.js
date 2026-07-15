'use strict'

Command.cases.changeActorSprite = {
	initialize: function () {
		$('#changeActorSprite-confirm').on('click', this.save)

		// 侦听事件
		$('#changeActorSprite-animationId').on('write', (event) => {
			const items = Animation.getSpriteListItems(event.value)
			const elSpriteId = $('#changeActorSprite-spriteId')
			elSpriteId.loadItems(items)
			elSpriteId.write(elSpriteId.read())
		})
	},
	parse: function ({ actor, animationId, spriteId, image }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Command.parseFileName(animationId))
			.push(Command.parseSpriteName(animationId, spriteId))
			.push(Command.parseFileName(image))
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorSprite') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		animationId = '',
		spriteId = '',
		image = ''
	}) {
		const write = getElementWriter('changeActorSprite')
		write('actor', actor)
		write('animationId', animationId)
		write('spriteId', spriteId)
		write('image', image)
		$('#changeActorSprite-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorSprite')
		const actor = read('actor')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#changeActorSprite-animationId').getFocus()
		}
		const spriteId = read('spriteId')
		if (spriteId === '') {
			return $('#changeActorSprite-spriteId').getFocus()
		}
		const image = read('image')
		Command.save({ actor, animationId, spriteId, image })
	}
}
