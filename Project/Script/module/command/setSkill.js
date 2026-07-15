'use strict'

Command.cases.setSkill = {
	initialize: function () {
		$('#setSkill-confirm').on('click', this.save)

		// 创建操作选项
		$('#setSkill-operation').loadItems([
			{ name: 'Set Cooldown Time', value: 'set-cooldown' },
			{ name: 'Increase Cooldown Time', value: 'increase-cooldown' },
			{ name: 'Decrease Cooldown Time', value: 'decrease-cooldown' }
		])
	},
	parse: function ({ skill, operation, cooldown }) {
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
	load: function ({
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
	save: function () {
		const read = getElementReader('setSkill')
		const skill = read('skill')
		const operation = read('operation')
		switch (operation) {
			case 'set-cooldown':
			case 'increase-cooldown':
			case 'decrease-cooldown': {
				const cooldown = read('cooldown')
				Command.save({ skill, operation, cooldown })
				break
			}
		}
	}
}
