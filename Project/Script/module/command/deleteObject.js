'use strict'

Command.cases.deleteObject = new CommandSchema({
	name: 'deleteObject',
	customParse({ object }) {
		return [
			{ color: 'object' },
			{ text: Local.get('command.deleteObject') + Token(': ') },
			{ text: Command.parseObject(object) }
		]
	},
	customLoad({ object = { type: 'trigger' } }) {
		$('#deleteObject-object').write(object)
		$('#deleteObject-object').getFocus()
	},
	customSave() {
		Command.save({ object: $('#deleteObject-object').read() })
	}
})
