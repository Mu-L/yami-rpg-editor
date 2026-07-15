'use strict'

Command.cases.changeActorEquipment = {
	initialize: function () {
		$('#changeActorEquipment-confirm').on('click', this.save)

		// 创建操作选项
		$('#changeActorEquipment-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Add Instance', value: 'add-instance' },
			{ name: 'Remove Instance', value: 'remove-instance' },
			{ name: 'Remove Slot', value: 'remove-slot' }
		])

		// 设置关联元素
		$('#changeActorEquipment-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#changeActorEquipment-slot'),
						$('#changeActorEquipment-equipmentId')
					]
				},
				{
					case: 'remove',
					targets: [$('#changeActorEquipment-equipmentId')]
				},
				{
					case: 'add-instance',
					targets: [
						$('#changeActorEquipment-slot'),
						$('#changeActorEquipment-equipment')
					]
				},
				{
					case: 'remove-instance',
					targets: [$('#changeActorEquipment-equipment')]
				},
				{
					case: 'remove-slot',
					targets: [$('#changeActorEquipment-slot')]
				}
			])
	},
	parse: function ({ actor, operation, slot, equipmentId, equipment }) {
		const words = Command.words
			.push(Command.parseActor(actor))
			.push(Local.get('command.changeActorEquipment.' + operation))
		switch (operation) {
			case 'add': {
				const equipSlot = Command.parseVariableEnum(
					'equipment-slot',
					slot
				)
				const equipName = Command.parseFileName(equipmentId)
				words.push(equipSlot + Token(' = ') + equipName)
				break
			}
			case 'remove':
				words.push(Command.parseFileName(equipmentId))
				break
			case 'add-instance': {
				const equipSlot = Command.parseVariableEnum(
					'equipment-slot',
					slot
				)
				const equipName = Command.parseEquipment(equipment)
				words.push(equipSlot + Token(' = ') + equipName)
				break
			}
			case 'remove-instance':
				words.push(Command.parseEquipment(equipment))
				break
			case 'remove-slot':
				words.push(Command.parseVariableEnum('equipment-slot', slot))
				break
		}
		return [
			{ color: 'actor' },
			{ text: Local.get('command.changeActorEquipment') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		operation = 'add',
		slot = Enum.getDefStringId('equipment-slot'),
		equipmentId = '',
		equipment = { type: 'trigger' }
	}) {
		// 加载装备选项
		$('#changeActorEquipment-slot').loadItems(
			Enum.getStringItems('equipment-slot')
		)
		const write = getElementWriter('changeActorEquipment')
		write('actor', actor)
		write('operation', operation)
		write('slot', slot)
		write('equipmentId', equipmentId)
		write('equipment', equipment)
		$('#changeActorEquipment-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('changeActorEquipment')
		const actor = read('actor')
		const operation = read('operation')
		switch (operation) {
			case 'add': {
				const slot = read('slot')
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus()
				}
				const equipmentId = read('equipmentId')
				if (equipmentId === '') {
					return $('#changeActorEquipment-equipmentId').getFocus()
				}
				Command.save({ actor, operation, slot, equipmentId })
				break
			}
			case 'remove': {
				const equipmentId = read('equipmentId')
				if (equipmentId === '') {
					return $('#changeActorEquipment-equipmentId').getFocus()
				}
				Command.save({ actor, operation, equipmentId })
				break
			}
			case 'add-instance': {
				const slot = read('slot')
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus()
				}
				const equipment = read('equipment')
				Command.save({ actor, operation, slot, equipment })
				break
			}
			case 'remove-instance': {
				const equipment = read('equipment')
				Command.save({ actor, operation, equipment })
				break
			}
			case 'remove-slot':
				const slot = read('slot')
				if (slot === '') {
					return $('#changeActorEquipment-slot').getFocus()
				}
				Command.save({ actor, operation, slot })
				break
		}
	}
}
