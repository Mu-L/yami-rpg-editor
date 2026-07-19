import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.moveCamera = new CommandSchema({
	name: 'moveCamera',
	onInitialize() {
		$('#moveCamera-confirm').on('click', () => this.save())
		$('#moveCamera-mode').loadItems([
			{ name: 'Move to Position', value: 'position' },
			{ name: 'Follow Actor', value: 'actor' }
		])
		$('#moveCamera-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'position', targets: [$('#moveCamera-position')] },
				{ case: 'actor', targets: [$('#moveCamera-actor')] }
			])
		$('#moveCamera-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#moveCamera').on('open', () => {
			$('#moveCamera-easingId').loadItems(Data.createEasingItems())
		})
		$('#moveCamera').on('closed', () => {
			$('#moveCamera-easingId').clear()
		})
	},
	customParse({ mode, position, actor, easingId, duration, wait }) {
		const words = Command.words.push(
			Local.get('command.moveCamera.' + mode)
		)
		switch (mode) {
			case 'position':
				words.push(Command.parsePosition(position))
				break
			case 'actor':
				words.push(Command.parseActor(actor))
				break
		}
		words.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.moveCamera') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		mode = 'position',
		position = { type: 'absolute', x: 0, y: 0 },
		actor = { type: 'trigger' },
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}) {
		const write = getElementWriter('moveCamera')
		write('mode', mode)
		write('position', position)
		write('actor', actor)
		write('easingId', easingId)
		write('duration', duration)
		write('wait', wait)
		$('#moveCamera-mode').getFocus()
	},
	customSave() {
		const read = getElementReader('moveCamera')
		const mode = read('mode')
		const easingId = read('easingId')
		const duration = read('duration')
		const wait = read('wait')
		switch (mode) {
			case 'position': {
				const position = read('position')
				Command.save({ mode, position, easingId, duration, wait })
				break
			}
			case 'actor': {
				const actor = read('actor')
				Command.save({ mode, actor, easingId, duration, wait })
				break
			}
		}
	}
})
