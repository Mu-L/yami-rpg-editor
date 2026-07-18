'use strict'
import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.label = new CommandSchema({
	name: 'label',
	fields: [
		{ key: 'name', domId: 'name', default: '', required: true, trim: true }
	],
	customParse({ name }) {
		return [
			{ color: 'flow' },
			{ text: Local.get('command.label') + Token(': ') },
			{ color: 'label' },
			{ text: name }
		]
	},
	onLoad() {
		$('#label-name').getFocus('all')
	}
})
