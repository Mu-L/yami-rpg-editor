'use strict'

Command.cases.changeActorSkill = {
	initialize: function () {
		$('#changeActorSkill-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeActorSkill-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Remove Instance', value: 'remove-instance' },
			{ name: 'Sort by Filename', value: 'sort-by-order' }
		])

		// 设置关联元素
		$('#changeActorSkill-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#changeActorSkill-skillId')]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorSkill-skill')]
				}
			])
	},
	parseOperation: function (operation) {
		return Local.get('command.changeActorSkill.' + operation)
	},
	parse: function ({ actor, operation, skill, skillId }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseOperation(operation))
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseVariableFile(skillId))
				break
			case 'remove-instance':
				words.push(Command.parseSkill(skill))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorSkill') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'add',
		skillId = '',
		skill = { type: 'trigger' }
	}) {
		const write = getElementWriter('changeActorSkill')
		write('actor', actor)
		write('operation', operation)
		write('skillId', skillId)
		write('skill', skill)
		$('#changeActorSkill-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorSkill')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'add':
			case 'remove': {
				const skillId = read('skillId')
				if (skillId === '') {
					return $('#changeActorSkill-skillId').getFocus()
				}
				Command.save({ actor, operation, skillId })
				break
			}
			case 'remove-instance': {
				const skill = read('skill')
				Command.save({ actor, operation, skill })
				break
			}
			case 'sort-by-order':
				Command.save({ actor, operation })
				break
		}
	}
}
