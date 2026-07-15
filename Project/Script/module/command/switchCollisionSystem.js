'use strict'

Command.cases.switchCollisionSystem = {
	initialize: function () {
		$('#switchCollisionSystem-confirm').on('click', this.save)

		// 创建操作选项
		$('#switchCollisionSystem-operation').loadItems([
			{ name: 'Enable Actor Collision', value: 'enable-actor-collision' },
			{
				name: 'Disable Actor Collision',
				value: 'disable-actor-collision'
			},
			{ name: 'Enable Scene Collision', value: 'enable-scene-collision' },
			{
				name: 'Disable Scene Collision',
				value: 'disable-scene-collision'
			}
		])
	},
	parse: function ({ operation }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.switchCollisionSystem') + Token(': ') },
			{ text: Local.get('command.switchCollisionSystem.' + operation) }
		]
	},
	load: function ({ operation = 'enable-actor-collision' }) {
		$('#switchCollisionSystem-operation').write(operation)
		$('#switchCollisionSystem-operation').getFocus()
	},
	save: function () {
		const operation = $('#switchCollisionSystem-operation').read()
		Command.save({ operation })
	}
}
