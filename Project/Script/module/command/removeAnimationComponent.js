import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Animation } from '../../animation/animation-window.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.removeAnimationComponent = new CommandSchema({
	name: 'removeAnimationComponent',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'animationId', default: '', required: true },
		{ key: 'motion', default: '', required: true }
	],
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
	onLoad() {
		$('#removeAnimationComponent-actor').getFocus()
	}
})
