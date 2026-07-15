'use strict'

Command.cases.setNumber = {
	initialize: function () {
		$('#setNumber-confirm').on('click', this.save)

		// 绑定操作数列表
		$('#setNumber-operands').bind(NumberOperand)

		// 清理内存 - 窗口已关闭事件
		$('#setNumber').on('closed', (event) => {
			$('#setNumber-operands').clear()
		})
	},
	parseOperation: function (operation) {
		switch (operation) {
			case 'set':
				return ' = '
			case 'add':
				return ' += '
			case 'sub':
				return ' -= '
			case 'mul':
				return ' *= '
			case 'div':
				return ' /= '
			case 'mod':
				return ' %= '
		}
	},
	parseOperands: function (operands) {
		let expression = ''
		let currentPriority
		let nextPriority = false
		const length = operands.length
		for (let i = 0; i < length; i++) {
			const operand = operands[i]
			let operandName = NumberOperand.parseOperand(operand)
			if (i !== 0)
				switch (operand.operation.replace('()', '')) {
					case 'add':
						expression += Command.setOperatorColor(' + ')
						break
					case 'sub':
						expression += Command.setOperatorColor(' - ')
						break
					case 'mul':
						expression += Command.setOperatorColor(' * ')
						break
					case 'div':
						expression += Command.setOperatorColor(' / ')
						break
					case 'mod':
						expression += Command.setOperatorColor(' % ')
						break
				}
			currentPriority = nextPriority
			nextPriority = operands[i + 1]?.operation.includes('()')
			if (!currentPriority && nextPriority) {
				operandName = Token('(') + operandName
			}
			if (currentPriority && !nextPriority) {
				operandName = operandName + Token(')')
			}
			expression += operandName
		}
		return expression
	},
	parse: function ({ variable, operation, operands }) {
		const varDesc = Command.parseVariable(
			variable,
			'number',
			operation === 'set'
		)
		const operator = Command.setOperatorColor(
			this.parseOperation(operation)
		)
		const expression = this.parseOperands(operands)
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setNumber.alias') + ' ' },
			{ color: 'restore' },
			{ text: `${varDesc}${operator}${expression}` }
		]
	},
	load: function ({
		variable = { type: 'local', key: '' },
		operation = 'set',
		operands = [{ operation: 'add', type: 'constant', value: 0 }]
	}) {
		const write = getElementWriter('setNumber')
		write('variable', variable)
		write('operation', operation)
		write('operands', operands.slice())
		$('#setNumber-variable').getFocus()
	},
	save: function () {
		const read = getElementReader('setNumber')
		const variable = read('variable')
		if (VariableGetter.isNone(variable)) {
			return $('#setNumber-variable').getFocus()
		}
		const operation = read('operation')
		const operands = read('operands')
		if (operands.length === 0) {
			return $('#setNumber-operands').getFocus()
		}
		operands[0].operation = 'add'
		Command.save({ variable, operation, operands })
	}
}
