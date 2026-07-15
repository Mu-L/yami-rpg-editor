'use strict'

Command.cases.jumpTo = {
	initialize: function () {
		$('#jumpTo-confirm').on('click', this.save)

		// 侦听文本提示
		TextSuggestion.listen($('#jumpTo-label'), this.loadLabels)

		// 创建操作选项
		$('#jumpTo-operation').loadItems([
			{ name: 'Jump to Label', value: 'jump' },
			{ name: 'Save and Jump to Label', value: 'save-jump' },
			{ name: 'Jump to the Saved Location', value: 'return' }
		])

		// 设置操作关联元素
		$('#jumpTo-operation')
			.enableHiddenMode()
			.relate([
				{ case: ['jump', 'save-jump'], targets: [$('#jumpTo-label')] }
			])
	},
	parse: function ({ operation, label }) {
		const words = Command.words
		switch (operation) {
			case 'jump':
				words.push(label)
				break
			case 'save-jump':
				words.push(label).push(Local.get('command.jumpTo.save'))
				break
			case 'return':
				words.push(Local.get('command.jumpTo.savedLocation'))
				break
		}
		return [
			{ color: 'flow' },
			{ text: Local.get('command.jumpTo.alias') + Token(': ') },
			{ text: words.join() }
		]
	},
	load: function ({ operation = 'jump', label = '' }) {
		$('#jumpTo-operation').write(operation)
		$('#jumpTo-label').write(label)
		$('#jumpTo-operation').getFocus()
	},
	save: function () {
		const operation = $('#jumpTo-operation').read()
		switch (operation) {
			case 'jump':
			case 'save-jump': {
				const label = $('#jumpTo-label').read().trim()
				if (label === '') {
					return $('#jumpTo-label').getFocus()
				}
				Command.save({ operation, label })
				break
			}
			case 'return':
				Command.save({ operation })
				break
		}
	},
	// 加载本地变量键
	loadLabels: function () {
		const items = []
		const commands = EventEditor.commandList.read()
		if (!commands) return items
		// 遍历目标事件的指令列表
		Command.forEachCommand(commands, (command) => {
			if (command.id === 'label') {
				items.push({
					name: command.params.name,
					icon: 'icon-label'
				})
			}
		})
		// 按名称排序列表项，并返回
		return items.sort((a, b) => a.name.localeCompare(b.name))
	}
}
