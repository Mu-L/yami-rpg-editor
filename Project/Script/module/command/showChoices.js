'use strict'

Command.cases.showChoices = {
	initialize: function () {
		$('#showChoices-confirm').on('click', this.save)

		// 绑定选项列表
		$('#showChoices-choices').bind(Choices)

		// 清理内存 - 窗口已关闭事件
		$('#showChoices').on('closed', (event) => {
			$('#showChoices-choices').clear()
		})
	},
	parse: function ({ choices, parameters }) {
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: Local.get('command.showChoices') + Token(': ') },
			{ color: 'text' },
			{ color: 'save' }
		]
		// 添加选项数量
		contents.push({ text: Command.setNumberColor(choices.length) })
		// 添加参数内容
		if (parameters) {
			contents.push(
				{ color: 'gray' },
				{ color: 'save' },
				{
					text:
						' ' +
						Token('(') +
						Command.setCommaColors(parameters) +
						Token(')')
				}
			)
		}
		contents.push({ color: 'flow' })
		// 换行
		contents.push({ break: true })
		// 添加选项分支内容
		const when = Local.get('command.showChoices.when')
		for (const choice of choices) {
			contents.push(
				{ color: 'flow' },
				{ text: when + ' ' },
				{ color: 'text' },
				{
					text: Command.parseVariableTag(
						GameLocal.replace(choice.content)
					)
				},
				{ children: choice.commands }
			)
		}
		contents.push(
			{ color: 'flow' },
			{ text: Local.get('command.showChoices.end') }
		)
		return contents
	},
	createDefaultChoices: function () {
		return [
			{
				content: Local.get('showChoices.yes'),
				commands: []
			},
			{
				content: Local.get('showChoices.no'),
				commands: []
			}
		]
	},
	load: function ({
		choices = this.createDefaultChoices(),
		parameters = ''
	}) {
		const write = getElementWriter('showChoices')
		write('choices', choices.slice())
		write('parameters', parameters)
		Command.cases.showChoices.choices = choices
		$('#showChoices-choices').getFocus()
	},
	save: function () {
		const read = getElementReader('showChoices')
		const choices = read('choices')
		if (choices.length === 0) {
			return $('#showChoices-choices').getFocus()
		}
		const parameters = read('parameters')
		Command.save({ choices, parameters })
	}
}
