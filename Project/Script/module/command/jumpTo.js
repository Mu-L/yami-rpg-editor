import { $ } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { EventEditor } from '../../command/event-editor.js'
import { Token } from '../../command/mark-string-manager.js'
import { TextSuggestion } from '../../command/text-tip.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.jumpTo = new CommandSchema({
	name: 'jumpTo',
	onInitialize() {
		$('#jumpTo-confirm').on('click', () => this.save())
		TextSuggestion.listen($('#jumpTo-label'), this.loadLabels)
		$('#jumpTo-operation').loadItems([
			{ name: 'Jump to Label', value: 'jump' },
			{ name: 'Save and Jump to Label', value: 'save-jump' },
			{ name: 'Jump to the Saved Location', value: 'return' }
		])
		$('#jumpTo-operation')
			.enableHiddenMode()
			.relate([
				{ case: ['jump', 'save-jump'], targets: [$('#jumpTo-label')] }
			])
	},
	loadLabels() {
		const items = []
		const commands = EventEditor.commandList.read()
		if (!commands) return items
		Command.forEachCommand(commands, (command) => {
			if (command.id === 'label') {
				items.push({
					name: command.params.name,
					icon: 'icon-label'
				})
			}
		})
		return items.sort((a, b) => a.name.localeCompare(b.name))
	},
	customParse({ operation, label }) {
		const words = Command.words
		switch (operation) {
			case 'jump':
				words.push(label)
				break
			case 'save-jump':
				words.push(label).push(Local.get('command.jumpTo.save'))
				break
			case 'return':
				words.push(Local.get('command.jumpTo.savedLocation'))
				break
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.jumpTo.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({ operation = 'jump', label = '' }) {
		$('#jumpTo-operation').write(operation)
		$('#jumpTo-label').write(label)
		$('#jumpTo-operation').getFocus()
	},
	customSave() {
		const operation = $('#jumpTo-operation').read()
		switch (operation) {
			case 'jump':
			case 'save-jump': {
				const label = $('#jumpTo-label').read().trim()
				if (label === '') {
					return $('#jumpTo-label').getFocus()
				}
				Command.save({ operation, label })
				break
			}
			case 'return':
				Command.save({ operation })
				break
		}
	}
})
