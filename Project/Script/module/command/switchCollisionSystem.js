'use strict'

Command.cases.switchCollisionSystem = new CommandSchema({
	name: 'switchCollisionSystem',
	onInitialize() {
		$('#switchCollisionSystem-confirm').on('click', () => this.save())
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
	customParse({ operation }) {
		return [
			{ color: 'system' },
			{ text: Local.get('command.switchCollisionSystem') + Token(': ') },
			{ text: Local.get('command.switchCollisionSystem.' + operation) }
		]
	},
	customLoad({ operation = 'enable-actor-collision' }) {
		$('#switchCollisionSystem-operation').write(operation)
		$('#switchCollisionSystem-operation').getFocus()
	},
	customSave() {
		Command.save({
			operation: $('#switchCollisionSystem-operation').read()
		})
	}
})
