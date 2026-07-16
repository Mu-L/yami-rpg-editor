'use strict'

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

	// 默认数据工厂
	createDefault() {
		const data = {}
		for (const field of this.fields) {
			if (field.default !== undefined) {
				data[field.key] = field.default
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
			const value = data[field.key] ?? field.default
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
}

window.CommandSchema = CommandSchema
