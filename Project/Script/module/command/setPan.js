import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setPan = new CommandSchema({
	name: 'setPan',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'pan', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setPan-confirm').on('click', () => this.save())
		$('#setPan-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])
		$('#setPan-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setPan').on('open', function (event) {
			$('#setPan-easingId').loadItems(Data.createEasingItems())
		})
		$('#setPan').on('closed', function (event) {
			$('#setPan-easingId').clear()
		})
	},
	customParse({ type, pan, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(pan))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setPan') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setPan-type').getFocus()
	}
})
