import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setAmbientLight = new CommandSchema({
	name: 'setAmbientLight',
	fields: [
		{ key: 'red', default: 0 },
		{ key: 'green', default: 0 },
		{ key: 'blue', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setAmbientLight-confirm').on('click', () => this.save())
		$('#setAmbientLight-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setAmbientLight').on('open', function (event) {
			$('#setAmbientLight-easingId').loadItems(Data.createEasingItems())
		})
		$('#setAmbientLight').on('closed', function (event) {
			$('#setAmbientLight-easingId').clear()
		})
	},
	parseColor(red, green, blue) {
		const r = Command.parseVariableNumber(red)
		const g = Command.parseVariableNumber(green)
		const b = Command.parseVariableNumber(blue)
		return (
			'RGB' +
			Token('(') +
			r +
			Token(', ') +
			g +
			Token(', ') +
			b +
			Token(')')
		)
	},
	customParse({ red, green, blue, easingId, duration, wait }) {
		const words = Command.words
			.push(this.parseColor(red, green, blue))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'scene' },
			{ text: Local.get('command.setAmbientLight') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setAmbientLight-red').getFocus('all')
	}
})
