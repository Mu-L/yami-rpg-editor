import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { IfBranch } from '../../command/conditional-branch-window.js'
import { IfCondition } from '../../command/conditional-condition-window.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.loop = new CommandSchema({
	name: 'loop',
	onInitialize() {
		$('#loop-confirm').on('click', () => this.save())
		$('#loop-conditions').bind(IfCondition)
		$('#loop-mode').loadItems([
			{ name: 'Meet All', value: 'all' },
			{ name: 'Meet Any', value: 'any' }
		])
		$('#loop').on('closed', () => {
			this.commands = null
			$('#loop-conditions').clear()
		})
	},
	customParse({ mode, conditions, commands }) {
		const contents = [{ fold: true }, { color: 'flow' }]
		if (conditions.length !== 0) {
			const condition = IfBranch.parse({ mode, conditions })
			contents.push(
				{ text: Local.get('command.loop.while') },
				{ color: 'restore' },
				{ text: ' ' + condition }
			)
		} else {
			contents.push({ text: Local.get('command.loop') })
		}
		contents.push(
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.loop.end') }
		)
		return contents
	},
	customLoad({ mode = 'all', conditions = [], commands = [] }) {
		const write = getElementWriter('loop')
		write('mode', mode)
		write('conditions', conditions.slice())
		this.commands = commands
		$('#loop-conditions').getFocus()
	},
	customSave() {
		const read = getElementReader('loop')
		const mode = read('mode')
		const conditions = read('conditions')
		Command.save({ mode, conditions, commands: this.commands })
	}
})
