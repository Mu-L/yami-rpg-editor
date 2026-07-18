'use strict'
import { $, getElementReader, getElementWriter } from '../../util/dom.js'
import { Command } from '../../command/command-object.js'
import { Token } from '../../command/mark-string-manager.js'
import { CommandSchema } from './schema.js'
import { Local } from '../../tools/localization.js'

Command.cases.setSkill = new CommandSchema({
	name: 'setSkill',
	onInitialize() {
		$('#setSkill-confirm').on('click', () => this.save())
		$('#setSkill-operation').loadItems([
			{ name: 'Set Cooldown Time', value: 'set-cooldown' },
			{ name: 'Increase Cooldown Time', value: 'increase-cooldown' },
			{ name: 'Decrease Cooldown Time', value: 'decrease-cooldown' }
		])
	},
	customParse({ skill, operation, cooldown }) {
		const words = Command.words
			.push(Command.parseSkill(skill))
			.push(Local.get('command.setSkill.' + operation))
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown':
				words.push(Command.parseVariableNumber(cooldown, 'ms'))
				break
		}
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setSkill') + Token(': ') },
			{ text: words.join() }
		]
	},
	customLoad({
		skill = { type: 'trigger' },
		operation = 'set-cooldown',
		cooldown = 0
	}) {
		const write = getElementWriter('setSkill')
		write('skill', skill)
		write('operation', operation)
		write('cooldown', cooldown)
		$('#setSkill-skill').getFocus()
	},
	customSave() {
		const read = getElementReader('setSkill')
		const skill = read('skill')
		const operation = read('operation')
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown': {
				Command.save({
					skill,
					operation,
					cooldown: read('cooldown')
				})
				break
			}
		}
	}
})
