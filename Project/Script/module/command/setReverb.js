'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setReverb = new CommandSchema({
	name: 'setReverb',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'dry', default: 1 },
		{ key: 'wet', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setReverb-confirm').on('click', () => this.save())
		$('#setReverb-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])
		$('#setReverb-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setReverb').on('open', function (event) {
			$('#setReverb-easingId').loadItems(Data.createEasingItems())
		})
		$('#setReverb').on('closed', function (event) {
			$('#setReverb-easingId').clear()
		})
	},
	customParse({ type, dry, wet, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(dry))
			.push(Command.parseVariableNumber(wet))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setReverb') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setReverb-type').getFocus()
	}
})
