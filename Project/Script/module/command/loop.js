'use strict'

Command.cases.loop = {
	commands: null,
	initialize: function () {
		$('#loop-confirm').on('click', this.save)

		// 绑定条件列表
		$('#loop-conditions').bind(IfCondition)

		// 创建模式选项
		$('#loop-mode').loadItems([
			{ name: 'Meet All', value: 'all' },
			{ name: 'Meet Any', value: 'any' }
		])

		// 清理内存 - 窗口已关闭事件
		$('#loop').on('closed', (event) => {
			this.commands = null
			$('#loop-conditions').clear()
		})
	},
	parse: function ({ mode, conditions, commands }) {
		const contents = [{ fold: true }, { color: 'flow' }]
		if (conditions.length !== 0) {
			const condition = IfBranch.parse({ mode, conditions })
			contents.push(
				{ text: Local.get('command.loop.while') },
				{ color: 'restore' },
				{ text: ' ' + condition }
			)
		} else {
			contents.push({ text: Local.get('command.loop') })
		}
		contents.push(
			{ children: commands },
			{ color: 'flow' },
			{ text: Local.get('command.loop.end') }
		)
		return contents
	},
	load: function ({ mode = 'all', conditions = [], commands = [] }) {
		const write = getElementWriter('loop')
		write('mode', mode)
		write('conditions', conditions.slice())
		Command.cases.loop.commands = commands
		$('#loop-conditions').getFocus()
	},
	save: function () {
		const read = getElementReader('loop')
		const mode = read('mode')
		const conditions = read('conditions')
		const commands = Command.cases.loop.commands
		Command.save({ mode, conditions, commands })
	}
}
