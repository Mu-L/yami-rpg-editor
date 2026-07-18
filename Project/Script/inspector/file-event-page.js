'use strict'
import { $, getElementReader, getElementWriter } from '../util/dom.js'
import { Browser } from '../browser/project-browser.js'
import { EventEditor } from '../command/event-editor.js'
import { Enum } from '../enum/enum-window.js'
import { File } from '../file/file-system-core.js'
import { Inspector } from './inspector.js'
import { Light } from '../scene/light.js'
import { Local } from '../tools/localization.js'
import { Window } from '../tools/window-object.js'

// ******************************** 文件 - 事件页面 ********************************

{
	const FileEvent = {
		// properties
		target: null,
		meta: null,
		parameters: null,
		// methods
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		// events
		paramInput: null,
		typeWrite: null,
		listChange: null
	}

	// 初始化
	FileEvent.initialize = function () {
		// 创建类型选项
		$('#fileEvent-type').loadItems(EventEditor.types.global)
		EventEditor.types.relatedElements.push($('#fileEvent-type'))

		// 创建返回类型选项
		$('#fileEvent-returnType').loadItems([
			{ name: 'None', value: 'none' },
			{ name: 'Boolean', value: 'boolean' },
			{ name: 'Number', value: 'number' },
			{ name: 'String', value: 'string' },
			{ name: 'Object', value: 'object' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Trigger', value: 'trigger' },
			{ name: 'Light', value: 'light' },
			{ name: 'Element', value: 'element' }
		])

		// 绑定参数列表
		$('#fileEvent-parameters').bind(this.parameters)

		// 侦听事件
		$(
			`#fileEvent-type, #fileEvent-enabled, #fileEvent-priority, #fileEvent-namespace, #fileEvent-returnType, #fileEvent-description`
		).on('input', this.paramInput)
		$('#fileEvent-type').on('write', this.typeWrite)
		$('#fileEvent-parameters').on('change', this.listChange)
	}

	// 创建事件
	FileEvent.create = function (filter) {
		const type = EventEditor.types[filter][0].value
		switch (filter) {
			case 'global':
				return {
					type: type,
					enabled: true,
					priority: false,
					namespace: true,
					returnType: 'none',
					description: '',
					parameters: [],
					commands: []
				}
			default:
				return {
					type: type,
					enabled: true,
					commands: []
				}
		}
	}

	// 打开数据
	FileEvent.open = function (event, meta) {
		if (this.meta !== meta) {
			this.target = event
			this.meta = meta

			$('#fileEvent-type').loadItems(
				Enum.getMergedItems(EventEditor.types.global, 'global-event')
			)

			// 写入数据
			const write = getElementWriter('fileEvent', event)
			write('type')
			write('enabled')
			write('priority')
			write('namespace')
			write('returnType')
			write('description')
			write('parameters')
		}
	}

	// 关闭数据
	FileEvent.close = function () {
		if (this.target) {
			Browser.unselect(this.meta)
			this.target = null
			this.meta = null
			$('#fileEvent-parameters').clear()
		}
	}

	// 写入数据
	FileEvent.write = function (options) {
		if (options.type !== undefined) {
			$('#fileEvent-type').write(options.type)
		}
	}

	// 更新数据
	FileEvent.update = function (event, key, value) {
		File.planToSave(this.meta)
		switch (key) {
			case 'type':
			case 'priority':
			case 'namespace':
			case 'returnType':
			case 'description':
				if (event[key] !== value) {
					event[key] = value
				}
				break
			case 'enabled':
				if (event.enabled !== value) {
					event.enabled = value
					Browser.body.updateIcon(this.meta.file)
				}
				break
		}
	}

	// 参数 - 输入事件
	FileEvent.paramInput = function (event) {
		FileEvent.update(FileEvent.target, Inspector.getKey(this), this.read())
	}

	// 类型 - 写入事件
	FileEvent.typeWrite = function (event) {
		const enabledInput = $('#fileEvent-enabled')
		const enabledLabel = enabledInput.previousElementSibling
		const priorityInput = $('#fileEvent-priority')
		const priorityLabel = priorityInput.previousElementSibling
		switch (event.value) {
			case 'common':
				enabledLabel.hide()
				enabledInput.hide()
				break
			default:
				enabledLabel.show()
				enabledInput.show()
				break
		}
		switch (event.value) {
			case 'input':
			case 'keydown':
			case 'keyup':
			case 'mousedown':
			case 'mouseup':
			case 'mousemove':
			case 'doubleclick':
			case 'wheel':
			case 'touchstart':
			case 'touchmove':
			case 'touchend':
			case 'gamepadbuttonpress':
			case 'gamepadbuttonrelease':
			case 'gamepadleftstickchange':
			case 'gamepadrightstickchange':
				priorityLabel.show()
				priorityInput.show()
				break
			default:
				priorityLabel.hide()
				priorityInput.hide()
				break
		}
	}

	// 列表 - 改变事件
	FileEvent.listChange = function (event) {
		File.planToSave(FileEvent.meta)
	}

	// 事件参数列表接口
	FileEvent.parameters = {
		initialize: function (list) {
			$('#fileEvent-parameter-confirm').on('click', () => list.save())

			// 加载类型选项
			$('#fileEvent-parameter-type').loadItems([
				{ name: 'Boolean', value: 'boolean' },
				{ name: 'Number', value: 'number' },
				{ name: 'String', value: 'string' },
				{ name: 'Object', value: 'object' },
				{ name: 'Actor', value: 'actor' },
				{ name: 'Skill', value: 'skill' },
				{ name: 'State', value: 'state' },
				{ name: 'Equipment', value: 'equipment' },
				{ name: 'Item', value: 'item' },
				{ name: 'Trigger', value: 'trigger' },
				{ name: 'Light', value: 'light' },
				{ name: 'Element', value: 'element' }
			])
		},
		parse: function ({ type, key, note }) {
			return [
				{ content: key },
				{ content: Local.get('eventParameterTypes.' + type) }
			]
		},
		open: function ({ type = 'number', key = '', note = '' } = {}) {
			Window.open('fileEvent-parameter')
			const write = getElementWriter('fileEvent-parameter')
			write('type', type)
			write('key', key)
			write('note', note)
			$('#fileEvent-parameter-type').getFocus()
		},
		save: function () {
			const read = getElementReader('fileEvent-parameter')
			const type = read('type')
			const key = read('key').trim()
			if (!key) {
				return $('#fileEvent-parameter-key').getFocus()
			}
			const note = read('note').trim()
			Window.close('fileEvent-parameter')
			return { type, key, note }
		}
	}

	Inspector.fileEvent = FileEvent
}
