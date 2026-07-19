import { $, getElementReader } from '../util/dom.js'
import { VariableGetter } from './variable-accessor-window.js'
import { Enum } from '../enum/enum-window.js'
import { Window } from '../tools/window-object.js'
import { Variable } from '../variable/variable.js'

// ******************************** 技能访问器窗口 ********************************

export const SkillGetter = {
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
SkillGetter.initialize = function () {
	// 创建访问器类型选项
	$('#skillGetter-type').loadItems([
		{ name: 'Event Trigger Skill', value: 'trigger' },
		{ name: 'Latest Skill', value: 'latest' },
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Skill ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	])

	// 设置关联元素
	$('#skillGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-key',
				targets: [$('#skillGetter-actor'), $('#skillGetter-key')]
			},
			{
				case: 'by-id',
				targets: [$('#skillGetter-actor'), $('#skillGetter-skillId')]
			},
			{ case: 'variable', targets: [$('#skillGetter-variable')] }
		])

	// 侦听事件
	$('#skillGetter-confirm').on('click', this.confirm)
}

// 打开窗口
SkillGetter.open = function (target) {
	this.target = target
	Window.open('skillGetter')

	// 加载快捷键选项
	$('#skillGetter-key').loadItems(Enum.getStringItems('shortcut-key'))

	let actor = { type: 'trigger' }
	let key = Enum.getDefStringId('shortcut-key')
	let skillId = ''
	let variable = { type: 'local', key: '' }
	const skill = target.dataValue
	switch (skill.type) {
		case 'trigger':
		case 'latest':
			break
		case 'by-key':
			actor = skill.actor
			key = skill.key
			break
		case 'by-id':
			actor = skill.actor
			skillId = skill.skillId
			break
		case 'variable':
			variable = skill.variable
			break
	}
	$('#skillGetter-type').write(skill.type)
	$('#skillGetter-actor').write(actor)
	$('#skillGetter-key').write(key)
	$('#skillGetter-skillId').write(skillId)
	$('#skillGetter-variable').write(variable)
	$('#skillGetter-type').getFocus()
}

// 检查插件版本的技能访问器数据有效性
SkillGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'skill'
	}
	return false
}

// 创建插件版本的默认技能访问器
SkillGetter.createDefaultForPlugin = function () {
	return { getter: 'skill', type: 'trigger' }
}

// 确定按钮 - 鼠标点击事件
SkillGetter.confirm = function (event) {
	const read = getElementReader('skillGetter')
	const type = read('type')
	let getter
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type }
			break
		case 'by-key': {
			const actor = read('actor')
			const key = read('key')
			if (key === '') {
				return $('#skillGetter-key').getFocus()
			}
			getter = { type, actor, key }
			break
		}
		case 'by-id': {
			const actor = read('actor')
			const skillId = read('skillId')
			if (skillId === '') {
				return $('#skillGetter-skillId').getFocus()
			}
			getter = { type, actor, skillId }
			break
		}
		case 'variable': {
			const variable = read('variable')
			if (VariableGetter.isNone(variable)) {
				return $('#skillGetter-variable').getFocus()
			}
			getter = { type, variable }
			break
		}
	}
	// 如果是插件输入框，额外附加一个属性
	if (this.target.isPluginInput) {
		getter = { getter: 'skill', ...getter }
	}
	this.target.input(getter)
	Window.close('skillGetter')
}.bind(SkillGetter)
