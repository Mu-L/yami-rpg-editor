'use strict'

Command.cases.useItem = {
	initialize: function () {
		$('#useItem-confirm').on('click', this.save)

		// 创建模式选项
		$('#useItem-mode').loadItems([
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Item ID', value: 'by-id' },
			{ name: 'By Item Instance', value: 'by-item' }
		])

		// 设置模式关联元素
		$('#useItem-mode')
			.enableHiddenMode()
			.relate([
				{ case: 'by-key', targets: [$('#useItem-key')] },
				{ case: 'by-id', targets: [$('#useItem-itemId')] },
				{ case: 'by-item', targets: [$('#useItem-item')] }
			])

		// 创建等待结束选项
		$('#useItem-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		])
	},
	parse: function ({ actor, mode, key, itemId, item, wait }) {
		const words = Command.words.push(Command.parseActor(actor))
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString('shortcut-key', key))
				break
			case 'by-id':
				words.push(Command.parseFileName(itemId))
				break
			case 'by-item':
				words.push(Command.parseItem(item))
				break
		}
		words.push(Command.parseWait(wait))
		return [
			{ color: 'inventory' },
			{ text: Local.get('command.useItem') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({
		actor = { type: 'trigger' },
		mode = 'by-key',
		key = Enum.getDefStringId('shortcut-key'),
		itemId = '',
		item = { type: 'trigger' },
		wait = false
	}) {
		// 加载快捷键选项
		$('#useItem-key').loadItems(Enum.getStringItems('shortcut-key'))
		const write = getElementWriter('useItem')
		write('actor', actor)
		write('mode', mode)
		write('key', key)
		write('itemId', itemId)
		write('item', item)
		write('wait', wait)
		$('#useItem-actor').getFocus()
	},
	save: function () {
		const read = getElementReader('useItem')
		const actor = read('actor')
		const mode = read('mode')
		const wait = read('wait')
		switch (mode) {
			case 'by-key': {
				const key = read('key')
				if (key === '') {
					return $('#useItem-key').getFocus()
				}
				Command.save({ actor, mode, key, wait })
				break
			}
			case 'by-id': {
				const itemId = read('itemId')
				if (itemId === '') {
					return $('#useItem-itemId').getFocus()
				}
				Command.save({ actor, mode, itemId, wait })
				break
			}
			case 'by-item': {
				const item = read('item')
				Command.save({ actor, mode, item, wait })
				break
			}
		}
	}
}
