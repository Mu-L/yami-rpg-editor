import { $ } from '../../util/dom.js'
import { reportError } from '../../util/safe.js'
import { ActorGetter } from '../../command/actor-accessor-window.js'
import { AncestorGetter } from '../../command/ancestor-accessor-window.js'
import { AngleGetter } from '../../command/angle-accessor-window.js'
import { Command } from '../../command/command-object.js'
import { CommandSuggestion } from '../../command/command-tip.js'
import { ElementGetter } from '../../command/element-accessor-window.js'
import { EquipmentGetter } from '../../command/equipment-accessor-window.js'
import { ItemGetter } from '../../command/item-accessor-window.js'
import { LightGetter } from '../../command/light-accessor-window.js'
import { Token } from '../../command/mark-string-manager.js'
import { PositionGetter } from '../../command/position-accessor-window.js'
import { RegionGetter } from '../../command/region-accessor-window.js'
import { ObjectGetter } from '../../command/scene-object-accessor-window.js'
import { SkillGetter } from '../../command/skill-accessor-window.js'
import { StateGetter } from '../../command/state-accessor-window.js'
import { TextSuggestion } from '../../command/text-tip.js'
import { TilemapGetter } from '../../command/tilemap-accessor-window.js'
import { TriggerGetter } from '../../command/trigger-accessor-window.js'
import { VariableGetter } from '../../command/variable-accessor-window.js'
import { Data } from '../../data/data-object.js'
import { Local } from '../../tools/localization.js'
import { Window } from '../../tools/window-object.js'

// ******************************** 指令 schema 基类 ********************************

export class CommandSchema {
	name //:string
	fields //:array
	children //:boolean
	confirmId //:string

	constructor(config) {
		this.name = config.name
		this.fields = config.fields ?? []
		this.children = config.children ?? false
		this.confirmId = config.confirmId ?? `${config.name}-confirm`
		this.onParse = config.onParse
		this.onLoad = config.onLoad
		this.onSave = config.onSave
		this.onInitialize = config.initialize ?? config.onInitialize
		this.customParse = config.parse ?? config.customParse
		this.customLoad = config.load ?? config.customLoad
		this.customSave = config.save ?? config.customSave
		this.noWindow = config.noWindow ?? false
		// 挂载配置中其余属性（如 windowFrame / eventArgs 等数据字段，
		// 以及 parseMode / parseOperation 等辅助方法），
		// 使 this.xxx 在 onInitialize/customParse/Load/Save 内部可用
		const reserved = new Set([
			'name',
			'fields',
			'children',
			'confirmId',
			'onParse',
			'onLoad',
			'onSave',
			'initialize',
			'onInitialize',
			'parse',
			'customParse',
			'load',
			'customLoad',
			'save',
			'customSave',
			'noWindow'
		])
		for (const key of Object.keys(config)) {
			if (reserved.has(key) || key in this) {
				continue
			}
			this[key] = config[key]
		}
		if (this.noWindow) {
			this.load = null
			this.initialize = null
		}
	}

	// 取字段默认值（支持函数延迟求值）
	_getDefault(field) {
		return typeof field.default === 'function'
			? field.default()
			: field.default
	}

	// 默认数据工厂
	createDefault() {
		const data = {}
		for (const field of this.fields) {
			const value = this._getDefault(field)
			if (value !== undefined) {
				data[field.key] = value
			}
		}
		return data
	}

	// 初始化
	initialize() {
		if (this.onInitialize) {
			return this.onInitialize()
		}
		$(`#${this.confirmId}`).on('click', () => this.save())
	}

	// 解析 - 子类可重写或提供 parse 函数
	parse(data) {
		if (this.customParse) {
			return this.customParse(data)
		}
		const alias = Local.get(`command.${this.name}.alias`)
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: (alias ?? this.name) + Token(': ') },
			{ color: 'gray' },
			{ color: 'save' }
		]
		if (this.onParse) {
			this.onParse(data, contents)
		}
		return contents
	}

	// 加载
	load(data) {
		if (this.customLoad) {
			return this.customLoad(data)
		}
		for (const field of this.fields) {
			const value = data[field.key] ?? this._getDefault(field)
			$(`#${this.name}-${field.domId ?? field.key}`).write(value)
		}
		if (this.onLoad) {
			this.onLoad(data)
		}
	}

	// 保存
	save() {
		if (this.customSave) {
			return this.customSave()
		}
		const data = {}
		let focusTarget = null
		for (const field of this.fields) {
			const value = $(`#${this.name}-${field.domId ?? field.key}`).read()
			if (field.required && (value === '' || value === undefined)) {
				focusTarget = $(`#${this.name}-${field.domId ?? field.key}`)
				break
			}
			data[field.key] = value
		}
		if (focusTarget) {
			return focusTarget.getFocus()
		}
		if (this.onSave) {
			this.onSave(data)
		}
		Command.save(data)
	}

	// --- 静态分发方法 ---

	// 按 id 查找已注册的指令处理器
	static _resolve(id) {
		return Command.cases[id] ?? null
	}

	// 拓扑排序
	static _topoSort(names, getDeps) {
		const graph = new Map(names.map((n) => [n, []]))
		const inDegree = new Map(names.map((n) => [n, 0]))
		for (const name of names) {
			for (const dep of getDeps(name) ?? []) {
				if (!graph.has(dep)) continue
				graph.get(dep).push(name)
				inDegree.set(name, inDegree.get(name) + 1)
			}
		}
		const queue = names.filter((n) => inDegree.get(n) === 0)
		const result = []
		while (queue.length) {
			const node = queue.shift()
			result.push(node)
			for (const next of graph.get(node)) {
				inDegree.set(next, inDegree.get(next) - 1)
				if (inDegree.get(next) === 0) queue.push(next)
			}
		}
		return result
	}

	// 初始化所有指令
	static initAll() {
		Command.words = new Command.WordList()
		const subMap = {
			CommandSuggestion,
			TextSuggestion,
			VariableGetter,
			ActorGetter,
			SkillGetter,
			StateGetter,
			EquipmentGetter,
			ItemGetter,
			PositionGetter,
			AngleGetter,
			TriggerGetter,
			LightGetter,
			RegionGetter,
			TilemapGetter,
			ObjectGetter,
			ElementGetter,
			AncestorGetter
		}
		const sorted = CommandSchema._topoSort(
			Object.keys(subMap),
			(name) => subMap[name].dependsOn
		)
		for (const name of sorted) {
			subMap[name].initialize()
		}
		Command.custom.initialize()
		for (const object of Object.values(Command.cases)) {
			object.initialize?.()
		}
	}

	// 插入指令
	static insert(target, id) {
		Command.target = target
		if (id) {
			target.scrollAndResize()
			return CommandSchema.open(id)
		}
		CommandSuggestion.open()
	}

	// 打开指令窗口
	static open(id) {
		const handler = CommandSchema._resolve(id)
		if (handler !== undefined) {
			Command.id = id
			if (handler.load) {
				const point = Command.target.getSelectionPosition()
				if (point) {
					Window.setPositionMode('absolute')
					Window.absolutePos.x = point.x + 100
					Window.absolutePos.y = point.y
					Window.open(id)
					Window.setPositionMode('overlap')
					handler.load({})
				}
			} else {
				handler.save()
			}
			return
		}
		const meta = Data.scripts[id]
		if (meta !== undefined && Command.custom.commandNameMap?.[id]) {
			Command.id = id
			if (meta.parameters.length !== 0) {
				const point = Command.target.getSelectionPosition()
				if (point) {
					Window.setPositionMode('absolute')
					Window.absolutePos.x = point.x + 100
					Window.absolutePos.y = point.y
					Window.open('scriptCommand')
					Window.setPositionMode('overlap')
					Command.custom.load(id, {})
				}
			} else {
				Command.custom.save()
			}
		}
	}

	// 编辑指令
	static edit(target, command) {
		const { id, params } = command
		const handler = CommandSchema._resolve(id)
		if (handler?.load instanceof Function) {
			Command.target = target
			Command.id = id
			target.scrollAndResize()
			const point = target.getSelectionPosition()
			if (point) {
				Window.setPositionMode('absolute')
				Window.absolutePos.x = point.x + 100
				Window.absolutePos.y = point.y
				Window.open(id)
				Window.setPositionMode('overlap')
				handler.load(params)
			}
		}
		if (handler) return
		const meta = Data.scripts[id]
		if (
			meta?.parameters.length > 0 &&
			Command.custom.commandNameMap?.[id]
		) {
			Command.target = target
			Command.id = id
			target.scrollAndResize()
			const point = target.getSelectionPosition()
			if (point) {
				Window.setPositionMode('absolute')
				Window.absolutePos.x = point.x + 100
				Window.absolutePos.y = point.y
				Window.open('scriptCommand')
				Window.setPositionMode('overlap')
				Command.custom.load(id, params)
			}
		}
	}

	// 保存指令
	static save(params) {
		const { id, target } = Command
		target.save({ id, params })
		const handler = CommandSchema._resolve(id)
		if (handler !== undefined) {
			handler.load && Window.close(id)
		} else {
			Window.close('scriptCommand')
		}
	}

	// 解析指令
	static parse(command, varMap) {
		Command.varMap = varMap
		let id = command?.id
		if (id == null) {
			Command.invalid = true
			reportError(new Error('指令缺少 id'), 'CommandSchema.parse')
			return ''
		}
		if (id[0] === '!') {
			id = id.slice(1)
		}
		Command.invalid = false
		const params = command.params ?? {}
		const handler = CommandSchema._resolve(id)
		try {
			const contents = handler
				? handler.parse(params)
				: Command.custom.parse(id, params)
			return Command.parseTextTags(contents)
		} catch (err) {
			Command.invalid = true
			reportError(err, `CommandSchema.parse (id=${id})`)
			return `[解析失败: ${id}]`
		}
	}
}
