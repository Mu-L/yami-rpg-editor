import { $ } from '../util/dom.js'
import { RadioProxy } from '../components/radio-proxy.js'

// ******************************** 变量窗口 ********************************

export const Variable = {
	// properties
	list: $('#variable-list'),
	panel: $('#variable-properties-flex').hide(),
	manager: $('#variable-value-manager'),
	searcher: $('#variable-searcher'),
	inputs: {
		// 单一元素，DOM 直接可取
		name: $('#variable-name'),
		value: $('#variable-value-box'),
		number: $('#variable-value-number'),
		string: $('#variable-value-string'),
		note: $('#variable-note')
	},
	target: null,
	data: null,
	idMap: null,
	history: null,
	changed: false,
	// methods
	initialize: null,
	open: null,
	undo: null,
	redo: null,
	createId: null,
	register: null,
	unregister: null,
	getVariableById: null,
	openPropertyPanel: null,
	closePropertyPanel: null,
	unpackVariables: null,
	packVariables: null,
	saveHistory: null,
	// events
	windowClose: null,
	windowClosed: null,
	keydown: null,
	listKeydown: null,
	listPointerdown: null,
	listSelect: null,
	listRecord: null,
	listPopup: null,
	listOpen: null,
	nameInput: null,
	sortWrite: null,
	sortInput: null,
	typeWrite: null,
	typeInput: null,
	valueInput: null,
	noteInput: null,
	panelKeydown: null,
	searcherInput: null,
	confirm: null,
	apply: null
}

// list methods
Variable.list.copy = null
Variable.list.paste = null
Variable.list.delete = null
Variable.list.saveScroll = null
Variable.list.restoreScroll = null
Variable.list.cancelSearch = null
Variable.list.createFolder = null
Variable.list.createVariable = null
Variable.list.createIcon = null
Variable.list.updateIcon = null
Variable.list.addElementClass = null
Variable.list.updateItemClass = null

// radio-box 组的共享 radio-proxy 实例由 RadioBox 升级时惰性塞入 RadioProxy.map，
// 故 inputs.sort/type/boolean 不能在顶层求值（彼时 map 为空），改为惰性 getter
Object.defineProperties(Variable.inputs, {
	sort: {
		get() {
			return RadioProxy.map['variable-sort']
		},
		enumerable: true,
		configurable: true
	},
	type: {
		get() {
			return RadioProxy.map['variable-type']
		},
		enumerable: true,
		configurable: true
	},
	boolean: {
		get() {
			return RadioProxy.map['variable-value-boolean']
		},
		enumerable: true,
		configurable: true
	}
})

Variable.list.createInitText = null
Variable.list.updateInitText = null
Variable.list.createNoteIcon = null
Variable.list.updateNoteIcon = null
Variable.list.onCreate = null
Variable.list.onDelete = null
Variable.list.onResume = null

Variable.initialize = function () {
	const { list } = this
	list.removable = true
	list.renamable = true
	list.bind(() => this.data)
	list.creators.push(list.addElementClass)
	list.creators.push(list.updateItemClass)
	list.creators.push(list.createInitText)
	list.creators.push(list.updateInitText)
	list.creators.push(list.createNoteIcon)
	list.creators.push(list.updateNoteIcon)

	this.panel.variable = null
	this.searcher.addCloseButton()

	History.processors['variable-list-operation'] = (operation, data) => {
		const { response } = data
		list.restore(operation, response)
		if (list.read() === null && this.panel.variable !== null) {
			this.closePropertyPanel()
		}
		this.changed = true
	}
	History.processors['variable-name-change'] = (operation, data) => {
		const { item, value } = data
		data.value = item.name
		item.name = value
		list.updateItemName(item)
		if (this.panel.variable === item) {
			this.inputs.name.write(value)
		} else {
			list.select(item)
			list.expandToSelection()
			list.scrollToSelection()
		}
		this.changed = true
	}
	History.processors['variable-sort-change'] = (operation, data) => {
		const {
			item,
			value: { sort, value }
		} = data
		data.value.sort = item.sort
		data.value.value = item.value
		item.sort = sort
		item.value = value
		list.updateIcon(item)
		list.updateInitText(item)
		list.updateItemClass(item)
		if (this.panel.variable === item) {
			const type = typeof value
			this.inputs.sort.write(sort)
			this.inputs.type.write(type)
			this.inputs[type]?.write(value)
		} else {
			list.select(item)
			list.expandToSelection()
			list.scrollToSelection()
		}
		this.changed = true
	}
	History.processors['variable-type-change'] = (operation, data) => {
		const { item, value } = data
		data.value = item.value
		item.value = value
		list.updateIcon(item)
		list.updateInitText(item)
		if (this.panel.variable === item) {
			const type = typeof value
			this.inputs.type.write(type)
			this.inputs[type]?.write(value)
		} else {
			list.select(item)
			list.expandToSelection()
			list.scrollToSelection()
		}
		this.changed = true
	}
	History.processors['variable-value-change'] = (operation, data) => {
		const { item, value } = data
		data.value = item.value
		item.value = value
		list.updateInitText(item)
		if (this.panel.variable === item) {
			this.inputs[typeof value].write(value)
		} else {
			list.select(item)
			list.expandToSelection()
			list.scrollToSelection()
		}
		this.changed = true
	}
	History.processors['variable-note-change'] = (operation, data) => {
		const { item, value } = data
		data.value = item.note
		item.note = value
		list.updateNoteIcon(item)
		if (this.panel.variable === item) {
			this.inputs.note.write(value)
		} else {
			list.select(item)
			list.expandToSelection()
			list.scrollToSelection()
		}
		this.changed = true
	}

	$('#variable').on('close', this.windowClose)
	$('#variable').on('closed', this.windowClosed)
	list.on('keydown', this.listKeydown)
	list.on('pointerdown', this.listPointerdown)
	list.on('pointerdown', Reference.getPointerdownListener(list), {
		capture: true
	})
	list.on('select', this.listSelect)
	list.on('record', this.listRecord)
	list.on('popup', this.listPopup)
	list.on('open', this.listOpen)
	this.inputs.name.on('input', this.nameInput)
	this.inputs.sort.on('write', this.sortWrite)
	this.inputs.sort.on('input', this.sortInput)
	this.inputs.type.on('write', this.typeWrite)
	this.inputs.type.on('input', this.typeInput)
	this.inputs.boolean.on('input', this.valueInput)
	this.inputs.number.on('input', this.valueInput)
	this.inputs.string.on('input', this.valueInput)
	this.inputs.string.on('compositionend', this.valueInput)
	this.inputs.note.on('input', this.noteInput)
	this.inputs.note.on('compositionend', this.noteInput)
	this.panel.on('keydown', this.panelKeydown)
	this.searcher.on('input', this.searcherInput)
	this.searcher.on('compositionend', this.searcherInput)
	$('#variable-confirm').on('click', this.confirm)
	$('#variable-apply').on('click', this.apply)
}
