'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setLoop = new CommandSchema({
	name: 'setLoop',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'loop', default: false }
	],
	onInitialize() {
		$('#setLoop-confirm').on('click', () => this.save())
		$('#setLoop-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
		$('#setLoop-loop').loadItems([
			{ name: 'Once', value: false },
			{ name: 'Loop', value: true }
		])
	},
	parseLoop(loop) {
		switch (loop) {
			case false:
				return Local.get('command.setLoop.once')
			case true:
				return Local.get('command.setLoop.loop')
		}
	},
	customParse({ type, loop }) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(this.parseLoop(loop))
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setLoop') + Token(': ') },
			{ text: words.join() }
		]
	},
	onLoad() {
		$('#setLoop-type').getFocus()
	}
})
