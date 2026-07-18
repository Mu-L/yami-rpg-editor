'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Animation } from '../../animation/animation-window.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.changeActorSprite = new CommandSchema({
	name: 'changeActorSprite',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'spriteId', default: '', required: true },
		{ key: 'image', default: '' }
	],
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
	onLoad() {
		$('#changeActorSprite-actor').getFocus()
	}
})
