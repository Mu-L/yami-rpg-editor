'use strict'

Command.cases.renderOutline = {
	initialize: function () {
		$('#renderOutline-confirm').on('click', this.save)

		// 创建操作选项
		$('#renderOutline-operation').loadItems([
			{ name: 'Add', value: 'add' },
			{ name: 'Remove', value: 'remove' },
			{ name: 'Reset', value: 'reset' }
		])

		// 设置操作关联元素
		$('#renderOutline-operation')
			.enableHiddenMode()
			.relate([
				{
					case: 'add',
					targets: [
						$('#renderOutline-actor'),
						$('#renderOutline-color')
					]
				},
				{ case: 'remove', targets: [$('#renderOutline-actor')] }
			])
	},
	parse: function ({ operation, actor, color }) {
		const label = Local.get('command.renderOutline.' + operation)
		const words = Command.words
		switch (operation) {
			case 'add':
				words
					.push(label)
					.push(Command.parseActor(actor))
					.push(Command.parseHexColor(Color.simplifyHexColor(color)))
				break
			case 'remove':
				words.push(label).push(Command.parseActor(actor))
				break
			case 'reset':
				words.push(label)
				break
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.renderOutline') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		operation = 'add',
		actor = { type: 'trigger' },
		color = 'ffffffff'
	}) {
		$('#renderOutline-operation').write(operation)
		$('#renderOutline-actor').write(actor)
		$('#renderOutline-color').write(color)
		$('#renderOutline-operation').getFocus()
	},
	save: function () {
		const operation = $('#renderOutline-operation').read()
		switch (operation) {
			case 'add': {
				const actor = $('#renderOutline-actor').read()
				const color = $('#renderOutline-color').read()
				Command.save({ operation, actor, color })
				break
			}
			case 'remove': {
				const actor = $('#renderOutline-actor').read()
				Command.save({ operation, actor })
				break
			}
			case 'reset':
				Command.save({ operation })
				break
		}
	}
}
