import { $, getElementReader } from '../util/dom.js'
import { VariableGetter } from './variable-accessor-window.js'
import { PresetObject } from '../tools/scene-preset-window.js'
import { Window } from '../tools/window-object.js'
import { Variable } from '../variable/variable.js'

// ******************************** 角色访问器窗口 ********************************

export const ActorGetter = {
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
ActorGetter.initialize = function () {
	// 创建访问器类型选项
	$('#actorGetter-type').loadItems([
		{ name: 'Event Trigger Actor', value: 'trigger' },
		{ name: 'Skill Caster', value: 'caster' },
		{ name: 'Latest Actor', value: 'latest' },
		{ name: 'Target Actor', value: 'target' },
		{ name: 'Player Actor', value: 'player' },
		{ name: 'Party Member', value: 'member' },
		{ name: 'Global Actor', value: 'global' },
		{ name: 'By Actor ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	])

	// 设置关联元素
	$('#actorGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'member', targets: [$('#actorGetter-memberId')] },
			{ case: 'global', targets: [$('#actorGetter-actorId')] },
			{ case: 'by-id', targets: [$('#actorGetter-presetId')] },
			{ case: 'variable', targets: [$('#actorGetter-variable')] }
		])

	// 侦听事件
	$('#actorGetter-confirm').on('click', this.confirm)
}

// 打开窗口
ActorGetter.open = function (target) {
	this.target = target
	Window.open('actorGetter')

	let memberId = 0
	let actorId = ''
	let presetId = PresetObject.getDefaultPresetId('actor')
	let variable = { type: 'local', key: '' }
	const actor = target.dataValue
	switch (actor.type) {
		case 'trigger':
		case 'caster':
		case 'latest':
		case 'target':
		case 'player':
			break
		case 'member':
			memberId = actor.memberId
			break
		case 'global':
			actorId = actor.actorId
			break
		case 'by-id':
			presetId = actor.presetId
			break
		case 'variable':
			variable = actor.variable
			break
	}
	$('#actorGetter-type').write(actor.type)
	$('#actorGetter-memberId').write(memberId)
	$('#actorGetter-actorId').write(actorId)
	$('#actorGetter-presetId').write(presetId)
	$('#actorGetter-variable').write(variable)
	$('#actorGetter-type').getFocus()
}

// 检查插件版本的角色访问器数据有效性
ActorGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'actor'
	}
	return false
}

// 创建插件版本的默认角色访问器
ActorGetter.createDefaultForPlugin = function () {
	return { getter: 'actor', type: 'trigger' }
}

// 确定按钮 - 鼠标点击事件
ActorGetter.confirm = function (event) {
	const read = getElementReader('actorGetter')
	const type = read('type')
	let getter
	switch (type) {
		case 'trigger':
		case 'caster':
		case 'latest':
		case 'target':
		case 'player':
			getter = { type }
			break
		case 'member': {
			const memberId = read('memberId')
			getter = { type, memberId }
			break
		}
		case 'global': {
			const actorId = read('actorId')
			if (actorId === '') {
				return $('#actorGetter-actorId').getFocus()
			}
			getter = { type, actorId }
			break
		}
		case 'by-id': {
			const presetId = read('presetId')
			if (presetId === '') {
				return $('#actorGetter-presetId').getFocus()
			}
			getter = { type, presetId }
			break
		}
		case 'variable': {
			const variable = read('variable')
			if (VariableGetter.isNone(variable)) {
				return $('#actorGetter-variable').getFocus()
			}
			getter = { type, variable }
			break
		}
	}
	// 如果是插件输入框，额外附加一个属性
	if (this.target.isPluginInput) {
		getter = { getter: 'actor', ...getter }
	}
	this.target.input(getter)
	Window.close('actorGetter')
}.bind(ActorGetter)
