'use strict'

// 打开窗口
Variable.open = function (target = null) {
	this.target = target
	this.history = new History(100)
	this.unpackVariables()
	Window.open('variable')

	// 查询变量并更新列表
	const list = this.list
	const item = !target ? undefined : this.getVariableById(target.read())
	if (item && item.class !== 'folder') {
		list.initialize()
		list.select(item)
		list.expandToSelection(false)
		list.update()
		list.restoreScroll()
		list.scrollToSelection('middle')
	} else {
		list.update()
		list.restoreScroll()
		// 打开变量输入框时默认选择第一项
		if (target instanceof Object) {
			list.select(list.data[0])
		}
	}

	// 列表获得焦点
	list.getFocus()

	// 侦听事件
	window.on('keydown', this.keydown)
	window.on('keydown', Reference.getKeydownListener(list, 'variable'))
}

// 撤销操作
Variable.undo = function () {
	if (this.history.canUndo()) {
		this.history.restore('undo')
	}
}

// 重做操作
Variable.redo = function () {
	if (this.history.canRedo()) {
		this.history.restore('redo')
	}
}

// 确定按钮 - 鼠标点击事件
Variable.confirm = function (event) {
	const target = this.target
	if (target instanceof Object) {
		const variable = this.panel.variable
		if (variable === null) {
			return this.list.getFocus()
		}
		const filter = target.filter
		switch (filter) {
			case 'boolean':
			case 'number':
			case 'string':
			case 'object':
				if (typeof variable.value !== filter) {
					return $(`#variable-type-${filter}`).getFocus()
				}
				break
		}
		this.apply()
		target.input(variable.id)
	} else {
		this.apply()
	}
	Window.close('variable')
}.bind(Variable)

// 应用按钮 - 鼠标点击事件
Variable.apply = function (event) {
	if (this.changed) {
		this.changed = false

		// 保存变量数据
		this.packVariables()
		File.planToSave(Data.manifest.project.variables)

		// 发送变量改变事件
		window.dispatchEvent(new Event('variablechange'))
	}
}.bind(Variable)
