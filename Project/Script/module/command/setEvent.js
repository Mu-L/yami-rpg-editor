'use strict'

Command.cases.setEvent = {
	initialize: function () {
		$('#setEvent-confirm').on('click', this.save)

		// 创建操作选项
		$('#setEvent-operation').loadItems([
			{ name: 'Stop Propagation', value: 'stop-propagation' },
			{ name: 'Pause and Save to Variable', value: 'pause' },
			{ name: 'Continue and Reset Variable', value: 'continue' },
			{ name: 'Enable Global Event', value: 'enable' },
			{ name: 'Disable Global Event', value: 'disable' },
			{ name: 'Set to Highest Priority', value: 'highest-priority' },
			{ name: 'Go to Choice Branch', value: 'goto-choice-branch' }
		])

		// 设置操作关联元素
		$('#setEvent-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['pause', 'continue'],
					targets: [$('#setEvent-variable')]
				},
				{
					case: ['enable', 'disable', 'highest-priority'],
					targets: [$('#setEvent-eventId')]
				},
				{
					case: 'goto-choice-branch',
					targets: [$('#setEvent-choiceIndex')]
				}
			])
	},
	parse: function ({ operation, variable, eventId, choiceIndex }) {
		const words = Command.words.push(
			Local.get('command.setEvent.' + operation)
		)
		switch (operation) {
			case 'pause':
				words.push(Command.parseVariable(variable, 'object', true))
				break
			case 'continue':
				words.push(Command.parseVariable(variable, 'object'))
				break
			case 'enable':
			case 'disable':
			case 'highest-priority':
				words.push(Command.parseFileName(eventId))
				break
			case 'goto-choice-branch':
				words.push(Command.parseVariableNumber(choiceIndex))
				break
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.setEvent.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'stop-propagation',
		variable = { type: 'global', key: '' },
		eventId = '',
		choiceIndex = 0
	}) {
		// 补丁：删除了阻止和回复场景输入事件选项
		switch (operation) {
			case 'prevent-scene-input-events':
			case 'restore-scene-input-events':
				operation = 'stop-propagation'
				break
		}
		const write = getElementWriter('setEvent')
		write('operation', operation)
		write('variable', variable)
		write('eventId', eventId)
		write('choiceIndex', choiceIndex)
		$('#setEvent-operation').getFocus()
	},
	save: function () {
		const read = getElementReader('setEvent')
		const operation = read('operation')
		switch (operation) {
			case 'stop-propagation':
				Command.save({ operation })
				break
			case 'pause':
			case 'continue': {
				const variable = read('variable')
				if (VariableGetter.isNone(variable)) {
					return $('#setEvent-variable').getFocus()
				}
				Command.save({ operation, variable })
				break
			}
			case 'enable':
			case 'disable':
			case 'highest-priority': {
				const eventId = read('eventId')
				if (eventId === '') {
					return $('#setEvent-eventId').getFocus()
				}
				Command.save({ operation, eventId })
				break
			}
			case 'goto-choice-branch': {
				const choiceIndex = read('choiceIndex')
				Command.save({ operation, choiceIndex })
				break
			}
		}
	}
}
