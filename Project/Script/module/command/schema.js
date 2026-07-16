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
		this.onInitialize = config.initialize
		this.customParse = config.parse
		this.customLoad = config.load
		this.customSave = config.save
		this.noWindow = config.noWindow ?? false
		if (this.noWindow) {
			delete this.load
			delete this.initialize
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
