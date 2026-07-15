'use strict'

Command.cases.if = {
	elseCommands: null,
	initialize: function () {
		$('#if-confirm').on('click', this.save)

		// 绑定分支列表
		$('#if-branches').bind(IfBranch)

		// 绑定条件列表
		$('#if-branch-conditions').bind(IfCondition)

		// 清理内存 - 窗口已关闭事件
		$('#if').on('closed', (event) => {
			this.elseCommands = null
			$('#if-branches').clear()
		})
	},
	parse: function ({ branches, elseCommands }) {
		const contents = [{ fold: true }]
		const textIf = Local.get('command.if')
		const textElse = Local.get('command.if.else')
		for (let index = 0; index < branches.length; index++) {
			const branch = branches[index]
			contents.push(
				{ color: 'flow' },
				...(index === 0 ? [] : [{ text: textElse + ' ' }]),
				{ text: textIf + ' ' },
				{ color: 'normal' },
				{ text: IfBranch.parse(branch) },
				{ children: branch.commands }
			)
		}
		if (elseCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: Local.get('command.if.else') },
				{ children: elseCommands }
			)
		}
		contents.push({ color: 'flow' }, { text: Local.get('command.if.end') })
		return contents
	},
	load: function ({ branches = [], elseCommands = null }) {
		const write = getElementWriter('if')
		write('branches', branches.slice())
		write('else', !!elseCommands)
		Command.cases.if.elseCommands = elseCommands
		$('#if-branches').getFocus()
	},
	save: function () {
		const read = getElementReader('if')
		const branches = read('branches')
		if (branches.length === 0) {
			return $('#if-branches').getFocus()
		}
		switch (read('else')) {
			case true: {
				const elseCommands = Command.cases.if.elseCommands ?? []
				Command.save({ branches, elseCommands })
				break
			}
			case false:
				Command.save({ branches })
				break
		}
	}
}
