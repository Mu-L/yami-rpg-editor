'use strict'

Command.cases.changeActorSprite = new CommandSchema({
	name: 'changeActorSprite',
	onInitialize() {
		$('#changeActorSprite-confirm').on('click', () => this.save())
		$('#changeActorSprite-animationId').on('write', (event) => {
			const items = Animation.getSpriteListItems(event.value)
			const elSpriteId = $('#changeActorSprite-spriteId')
			elSpriteId.loadItems(items)
			elSpriteId.write(elSpriteId.read())
		})
	},
	customParse({ actor, animationId, spriteId, image }) {
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
	customLoad({
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
	customSave() {
		const read = getElementReader('changeActorSprite')
		const animationId = read('animationId')
		if (animationId === '') {
			return $('#changeActorSprite-animationId').getFocus()
		}
		const spriteId = read('spriteId')
		if (spriteId === '') {
			return $('#changeActorSprite-spriteId').getFocus()
		}
		Command.save({
			actor: read('actor'),
			animationId,
			spriteId,
			image: read('image')
		})
	}
})
