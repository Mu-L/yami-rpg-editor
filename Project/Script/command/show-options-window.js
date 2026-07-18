'use strict'
import { $ } from '../util/dom.js'
import { Command } from './command-object.js'
import { GameLocal } from '../local/local-object.js'
import { Window } from '../tools/window-object.js'

// ******************************** 显示选项窗口 ********************************

export const Choices = {
	// properties
	target: null,
	commands: null,
	// methods
	initialize: null,
	parse: null,
	open: null,
	save: null,
	// events
	windowClosed: null,
	confirm: null
}

// 初始化
Choices.initialize = function () {
	// 侦听事件
	$('#choice').on('closed', this.windowClosed)
	$('#choice-confirm').on('click', this.confirm)
}

// 解析项目
Choices.parse = function (choice) {
	return Command.removeTextTags(
		Command.parseVariableTag(GameLocal.replace(choice.content))
	)
}

// 打开数据
Choices.open = function (choice = { content: '', commands: [] }) {
	Window.open('choice')
	$('#choice-content').write(choice.content)
	$('#choice-content').getFocus('all')
	this.commands = choice.commands
}

// 保存数据
Choices.save = function () {
	const commands = this.commands
	const content = $('#choice-content').read().trim()
	if (content === '') {
		return $('#choice-content').getFocus()
	}
	Window.close('choice')
	return { content, commands }
}

// 窗口 - 已关闭事件
Choices.windowClosed = function (event) {
	Choices.commands = null
}

// 确定按钮 - 鼠标点击事件
Choices.confirm = function (event) {
	return Choices.target.save()
}
