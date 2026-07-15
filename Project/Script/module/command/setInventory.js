'use strict'

Command.cases.setInventory = {
	initialize: function () {
		$('#setInventory-confirm').on('click', this.save)

		// 创建操作选项
		$('#setInventory-operation').loadItems([
			{ name: 'Increase Money', value: 'increase-money' },
			{ name: 'Decrease Money', value: 'decrease-money' },
			{ name: 'Increase Items', value: 'increase-items' },
			{ name: 'Decrease Items', value: 'decrease-items' },
			{ name: 'Gain Equipment', value: 'gain-equipment' },
			{ name: 'Lose Equipment', value: 'lose-equipment' },
			{ name: 'Gain Equipment', value: 'gain-equipment-instance' },
			{ name: 'Lose Equipment', value: 'lose-equipment-instance' },
			{ name: 'Swap Order of Items', value: 'swap' },
			{ name: 'Sort Simply', value: 'sort' },
			{ name: 'Sort by Filename', value: 'sort-by-order' },
			{ name: "Use Global Actor's Inventory", value: 'reference' },
			{ name: 'Restore Inventory', value: 'dereference' },
			{ name: 'Reset', value: 'reset' }
		])

		// 设置关联元素
		$('#setInventory-operation')
			.enableHiddenMode()
			.relate([
				{
					case: ['increase-money', 'decrease-money'],
					targets: [$('#setInventory-money')]
				},
				{
					case: ['increase-items', 'decrease-items'],
					targets: [
						$('#setInventory-itemId'),
						$('#setInventory-quantity')
					]
				},
				{
					case: ['gain-equipment', 'lose-equipment'],
					targets: [$('#setInventory-equipmentId')]
				},
				{
					case: [
						'gain-equipment-instance',
						'lose-equipment-instance'
					],
					targets: [$('#setInventory-equipment')]
				},
				{
					case: 'swap',
					targets: [
						$('#setInventory-order1'),
						$('#setInventory-order2')
					]
				},
				{ case: 'reference', targets: [$('#setInventory-refActor')] }
			])
	},
	parse: function ({
		actor,
		operation,
		money,
		itemId,
		quantity,
		equipmentId,
		equipment,
		order1,
		order2,
		refActor
	}) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.setInventory.' + operation))
		switch (operation) {
			case 'increase-money':
			case 'decrease-money':
				words.push(Command.parseVariableNumber(money))
				break
			case 'increase-items':
			case 'decrease-items':
				words.push(Command.parseVariableFile(itemId))
				words.push(Command.parseVariableNumber(quantity))
				break
			case 'gain-equipment':
			case 'lose-equipment':
				words.push(Command.parseVariableFile(equipmentId))
				break
			case 'gain-equipment-instance':
			case 'lose-equipment-instance':
				words.push(Command.parseEquipment(equipment))
				break
			case 'swap': {
				const a = Command.parseVariableNumber(order1)
				const b = Command.parseVariableNumber(order2)
				words.push(a + Token(' <-> ') + b)
				break
			}
			case 'reference':
				words.push(Command.parseActor(refActor))
				break
		}
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.setInventory') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'increase-money',
		money = 1,
		itemId = '',
		quantity = 1,
		equipmentId = '',
		equipment = { type: 'trigger' },
		order1 = 0,
		order2 = 1,
		refActor = { type: 'player' }
	}) {
		const write = getElementWriter('setInventory')
		write('actor', actor)
		write('operation', operation)
		write('money', money)
		write('itemId', itemId)
		write('quantity', quantity)
		write('equipmentId', equipmentId)
		write('equipment', equipment)
		write('order1', order1)
		write('order2', order2)
		write('refActor', refActor)
		$('#setInventory-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('setInventory')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'increase-money':
			case 'decrease-money': {
				const money = read('money')
				Command.save({ actor, operation, money })
				break
			}
			case 'increase-items':
			case 'decrease-items': {
				const itemId = read('itemId')
				const quantity = read('quantity')
				if (itemId === '') {
					return $('#setInventory-itemId').getFocus()
				}
				Command.save({ actor, operation, itemId, quantity })
				break
			}
			case 'gain-equipment':
			case 'lose-equipment': {
				const equipmentId = read('equipmentId')
				if (equipmentId === '') {
					return $('#setInventory-equipmentId').getFocus()
				}
				Command.save({ actor, operation, equipmentId })
				break
			}
			case 'gain-equipment-instance':
			case 'lose-equipment-instance': {
				const equipment = read('equipment')
				Command.save({ actor, operation, equipment })
				break
			}
			case 'swap': {
				const order1 = read('order1')
				const order2 = read('order2')
				Command.save({ actor, operation, order1, order2 })
				break
			}
			case 'sort':
			case 'sort-by-order':
			case 'reset':
			case 'dereference':
				Command.save({ actor, operation })
				break
			case 'reference': {
				const refActor = read('refActor')
				Command.save({ actor, operation, refActor })
				break
			}
		}
	}
}
