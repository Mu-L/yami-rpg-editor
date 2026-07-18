'use strict'
import { Command } from './command-object.js'

// ******************************** 指令工具函数 ********************************

// 遍历指令列表中的每个指令
Command.forEachCommand = function (commands, handler) {
	const forEach = (commands) => {
		for (const command of commands) {
			handler(command)
			switch (command.id) {
				case 'showChoices':
					for (const choice of command.params.choices) {
						forEach(choice.commands)
					}
					continue
				case 'if':
					for (const branch of command.params.branches) {
						forEach(branch.commands)
					}
					if (command.params.elseCommands) {
						forEach(command.params.elseCommands)
					}
					continue
				case 'switch':
					for (const branch of command.params.branches) {
						forEach(branch.commands)
					}
					if (command.params.defaultCommands) {
						forEach(command.params.defaultCommands)
					}
					continue
				case 'loop':
					forEach(command.params.commands)
					continue
				case 'forEach':
					forEach(command.params.commands)
					continue
				case 'independent':
					forEach(command.params.commands)
					continue
				case 'transition':
					forEach(command.params.commands)
					continue
			}
		}
	}
	return forEach(commands)
}

// 词语列表类
Command.WordList = class WordList extends Array {
	count

	constructor() {
		super()
		this.count = 0
	}

	push(string) {
		if (string) this[this.count++] = string
		return this
	}

	join(joint = '$_delimiter_$, $_/_$') {
		const length = this.count
		if (length === 0) {
			return ''
		}
		this.count = 0
		let string = this[0]
		for (let i = 1; i < length; i++) {
			string += joint + this[i]
		}
		return string
	}
}
