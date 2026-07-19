import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { Choices } from '../../command/show-options-window.js'
import { GameLocal } from '../../local/local-object.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.showChoices = new CommandSchema({
	name: 'showChoices',
	onInitialize() {
		$('#showChoices-confirm').on('click', () => this.save())
		$('#showChoices-choices').bind(Choices)
		$('#showChoices').on('closed', () => {
			$('#showChoices-choices').clear()
		})
	},
	createDefaultChoices() {
		return [
			{
				content: Local.get('showChoices.yes'),
				commands: []
			},
			{
				content: Local.get('showChoices.no'),
				commands: []
			}
		]
	},
	customParse({ choices, parameters }) {
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.showChoices') + Token(': ') },
			{ color: 'text' },
			{ color: 'save' }
		]
		contents.push({ text: Command.setNumberColor(choices.length) })
		if (parameters) {
			contents.push(
				{ color: 'gray' },
				{ color: 'save' },
				{
					text:
						' ' +
						Token('(') +
						Command.setCommaColors(parameters) +
						Token(')')
				}
			)
		}
		contents.push({ color: 'flow' })
		contents.push({ break: true })
		const when = Local.get('command.showChoices.when')
		for (const choice of choices) {
			contents.push(
				{ color: 'flow' },
				{ text: when + ' ' },
				{ color: 'text' },
				{
					text: Command.parseVariableTag(
						GameLocal.replace(choice.content)
					)
				},
				{ children: choice.commands }
			)
		}
		contents.push(
			{ color: 'flow' },
			{ text: Local.get('command.showChoices.end') }
		)
		return contents
	},
	customLoad({ choices = this.createDefaultChoices(), parameters = '' }) {
		const write = getElementWriter('showChoices')
		write('choices', choices.slice())
		write('parameters', parameters)
		this.choices = choices
		$('#showChoices-choices').getFocus()
	},
	customSave() {
		const read = getElementReader('showChoices')
		const choices = read('choices')
		if (choices.length === 0) {
			return $('#showChoices-choices').getFocus()
		}
		const parameters = read('parameters')
		Command.save({ choices, parameters })
	}
})
