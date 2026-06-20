'use strict'

// 初始化
Variable.initialize = function () {
	// 绑定变量列表
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

	// 设置面板变量默认值
	this.panel.variable = null

	// 设置列表搜索框按钮
	this.searcher.addCloseButton()

	// 设置历史操作处理器
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

	// 侦听事件
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
