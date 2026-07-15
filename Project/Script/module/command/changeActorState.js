'use strict'

Command.cases.changeActorState = {
	initialize: function () {
		$('#changeActorState-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeActorState-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Remove Instance', value: 'remove-instance' }
		])

		// 设置操作关联元素
		$('#changeActorState-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['add', 'remove'],
					targets: [$('#changeActorState-stateId')]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorState-state')]
				}
			])
	},
	parseOperation: function (operation) {
		return Local.get('command.changeActorState.' + operation)
	},
	parse: function ({ actor, operation, stateId, state }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(this.parseOperation(operation))
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseFileName(stateId))
				break
			case 'remove-instance':
				words.push(Command.parseState(state))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorState') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'add',
		stateId = '',
		state = { type: 'trigger' }
	}) {
		const write = getElementWriter('changeActorState')
		write('actor', actor)
		write('operation', operation)
		write('stateId', stateId)
		write('state', state)
		$('#changeActorState-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorState')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'add':
			case 'remove': {
				const stateId = read('stateId')
				if (stateId === '') {
					return $('#changeActorState-stateId').getFocus()
				}
				Command.save({ actor, operation, stateId })
				break
			}
			case 'remove-instance': {
				const state = read('state')
				Command.save({ actor, operation, state })
				break
			}
		}
	}
}
