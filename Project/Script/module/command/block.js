'use strict'

Command.cases.block = {
	initialize: function () {
		$('#block-confirm').on('click', this.save)
	},
	parse: function ({ note, asynchronous, commands }) {
		// 补丁：2025-3-21
		if (asynchronous === undefined) {
			asynchronous = false
		}
		const asyncFlag = asynchronous ? Command.setOperatorColor('*') : ''
		const blockNote =
			note || asyncFlag ? Token(': ') + note + asyncFlag : ''
		return [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.block') + blockNote },
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.block.end') }
		]
	},
	load: function ({ note = '', asynchronous = false, commands = [] }) {
		$('#block-note').write(note)
		$('#block-asynchronous').write(asynchronous)
		$('#block-note').getFocus()
		Command.cases.block.commands = commands
	},
	save: function () {
		const note = $('#block-note').read().trim()
		const asynchronous = $('#block-asynchronous').read()
		const commands = Command.cases.block.commands
		Command.save({ note, asynchronous, commands })
	}
}
