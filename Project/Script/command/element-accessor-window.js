'use strict'
import { $, getElementReader } from '../util/dom.js'
import { VariableGetter } from './variable-accessor-window.js'
import { PresetElement } from '../tools/preset-element-window.js'
import { Window } from '../tools/window-object.js'
import { Variable } from '../variable/variable.js'

// ******************************** 元素访问器窗口 ********************************

export const ElementGetter = {
	// properties
	target: null,
	// methods
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	// events
	confirm: null
}

// 初始化
ElementGetter.initialize = function () {
	// 创建访问器类型选项
	$('#elementGetter-type').loadItems([
		{ name: 'Event Trigger Element', value: 'trigger' },
		{ name: 'Latest Element', value: 'latest' },
		{ name: 'By Element ID', value: 'by-id' },
		{ name: 'By Ancestor And ID', value: 'by-ancestor-and-id' },
		{ name: 'By Parent And Index', value: 'by-index' },
		{ name: 'By Focus And Button Index', value: 'by-button-index' },
		{ name: 'Get Selected Button In Focus', value: 'selected-button' },
		{ name: 'Get The Latest Focus Element', value: 'focus' },
		{ name: 'Get Parent Element', value: 'parent' },
		{ name: 'Variable', value: 'variable' }
	])

	// 设置关联元素
	$('#elementGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#elementGetter-presetId')] },
			{
				case: 'by-ancestor-and-id',
				targets: [
					$('#elementGetter-ancestor'),
					$('#elementGetter-presetId')
				]
			},
			{
				case: ['by-index', 'by-button-index'],
				targets: [
					$('#elementGetter-ancestor'),
					$('#elementGetter-index')
				]
			},
			{
				case: 'selected-button',
				targets: [$('#elementGetter-ancestor')]
			},
			{
				case: ['parent', 'variable'],
				targets: [$('#elementGetter-variable')]
			}
		])

	// 侦听事件
	$('#elementGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ElementGetter.open = function (target) {
	this.target = target
	Window.open('elementGetter')

	let index = 0
	let presetId = PresetElement.getDefaultPresetId()
	let ancestor = { type: 'trigger' }
	let variable = { type: 'local', key: '' }
	const element = target.dataValue
	switch (element.type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			break
		case 'by-id':
			presetId = element.presetId
			break
		case 'by-ancestor-and-id':
			ancestor = element.ancestor
			presetId = element.presetId
			break
		case 'by-index':
			ancestor = element.parent
			index = element.index
			break
		case 'by-button-index':
			ancestor = element.focus
			index = element.index
			break
		case 'selected-button':
			ancestor = element.focus
			break
		case 'parent':
		case 'variable':
			variable = element.variable
			break
	}
	$('#elementGetter-type').write(element.type)
	$('#elementGetter-ancestor').write(ancestor)
	$('#elementGetter-presetId').write(presetId)
	$('#elementGetter-index').write(index)
	$('#elementGetter-variable').write(variable)
	$('#elementGetter-type').getFocus()
}

// 检查插件版本的元素访问器数据有效性
ElementGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'element'
	}
	return false
}

// 创建插件版本的默认元素访问器
ElementGetter.createDefaultForPlugin = function () {
	return { getter: 'element', type: 'trigger' }
}

// 确定按钮 - 鼠标点击事件
ElementGetter.confirm = function (event) {
	const read = getElementReader('elementGetter')
	const type = read('type')
	let getter
	switch (type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			getter = { type }
			break
		case 'by-id': {
			const presetId = read('presetId')
			if (presetId === '') {
				return $('#elementGetter-presetId').getFocus()
			}
			getter = { type, presetId }
			break
		}
		case 'by-ancestor-and-id': {
			const ancestor = read('ancestor')
			const presetId = read('presetId')
			if (presetId === '') {
				return $('#elementGetter-presetId').getFocus()
			}
			getter = { type, ancestor, presetId }
			break
		}
		case 'by-index': {
			const parent = read('ancestor')
			const index = read('index')
			getter = { type, parent, index }
			break
		}
		case 'by-button-index': {
			const focus = read('ancestor')
			const index = read('index')
			getter = { type, focus, index }
			break
		}
		case 'selected-button': {
			const focus = read('ancestor')
			getter = { type, focus }
			break
		}
		case 'parent':
		case 'variable': {
			const variable = read('variable')
			if (VariableGetter.isNone(variable)) {
				return $('#elementGetter-variable').getFocus()
			}
			getter = { type, variable }
			break
		}
	}
	// 如果是插件输入框，额外附加一个属性
	if (this.target.isPluginInput) {
		getter = { getter: 'element', ...getter }
	}
	this.target.input(getter)
	Window.close('elementGetter')
}.bind(ElementGetter)
