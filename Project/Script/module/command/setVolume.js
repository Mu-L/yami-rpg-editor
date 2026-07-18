'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Data } from '../../data/data-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setVolume = new CommandSchema({
	name: 'setVolume',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'volume', default: 1 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setVolume-confirm').on('click', () => this.save())
		$('#setVolume-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		])
		$('#setVolume-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
		$('#setVolume').on('open', function (event) {
			$('#setVolume-easingId').loadItems(Data.createEasingItems())
		})
		$('#setVolume').on('closed', function (event) {
			$('#setVolume-easingId').clear()
		})
	},
	customParse({ type, volume, easingId, duration, wait }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(volume))
			.push(Command.parseEasing(easingId, duration, wait))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setVolume') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setVolume-type').getFocus()
	}
})
