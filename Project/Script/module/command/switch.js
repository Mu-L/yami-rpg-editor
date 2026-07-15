'use strict'

Command.cases.switch = {
	defaultCommands: null,
	initialize: function () {
		$('#switch-confirm').on('click', this.save)

		// 绑定分支列表
		$('#switch-branches').bind(SwitchBranch)

		// 绑定条件列表
		$('#switch-branch-conditions').bind(SwitchCondition)

		// 清理内存 - 窗口已关闭事件
		$('#switch').on('closed', (event) => {
			this.defaultCommands = null
			$('#switch-branches').clear()
		})
	},
	parse: function ({ variable, branches, defaultCommands }) {
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.switch') + ' ' },
			{ color: 'normal' },
			{ text: Command.parseVariable(variable, 'any') },
			{ break: true }
		]
		const textCase = Local.get('command.switch.case')
		for (const branch of branches) {
			contents.push(
				{ color: 'flow' },
				{ text: textCase + ' ' },
				{ color: 'normal' },
				{ text: SwitchBranch.parse(branch) },
				{ children: branch.commands }
			)
		}
		if (defaultCommands) {
			contents.push(
				{ color: 'flow' },
				{ text: Local.get('command.switch.default') },
				{ children: defaultCommands }
			)
		}
		contents.push(
			{ color: 'flow' },
			{ text: Local.get('command.switch.end') }
		)
		return contents
	},
	load: function ({
		variable = { type: 'local', key: '' },
		branches = [],
		defaultCommands = null
	}) {
		const write = getElementWriter('switch')
		write('variable', variable)
		write('branches', branches.slice())
		write('default', !!defaultCommands)
		Command.cases.switch.defaultCommands = defaultCommands
		$('#switch-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('switch')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#switch-variable').getFocus()
		}
		const branches = read('branches')
		if (branches.length === 0) {
			return $('#switch-branches').getFocus()
		}
		switch (read('default')) {
			case true: {
				const defaultCommands =
					Command.cases.switch.defaultCommands ?? []
				Command.save({ variable, branches, defaultCommands })
				break
			}
			case false:
				Command.save({ variable, branches })
				break
		}
	}
}
