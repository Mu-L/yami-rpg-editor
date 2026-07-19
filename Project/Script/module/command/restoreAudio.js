import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.restoreAudio = new CommandSchema({
	name: 'restoreAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	onInitialize() {
		$('#restoreAudio-confirm').on('click', () => this.save())
		$('#restoreAudio-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' }
		])
	},
	customParse({ type }) {
		return [
			{ color: 'audio' },
			{ text: Local.get('command.restoreAudio') + Token(': ') },
			{ text: Command.parseAudioType(type) }
		]
	},
	onLoad() {
		$('#restoreAudio-type').getFocus()
	}
})
