'use strict'

// 键盘按下事件
Variable.keydown = function (event) {
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyZ':
				if (!event.macRedoKey) {
					return Variable.undo()
				}
			case 'KeyY':
				return Variable.redo()
		}
	}
}

// 列表 - 键盘按下事件
Variable.listKeydown = function (event) {
	const item = this.read()
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy(item)
				break
			case 'KeyV':
				this.paste()
				break
		}
	} else if (event.altKey) {
		return
	} else {
		switch (event.code) {
			case 'Insert':
				this.addNodeTo(this.createVariable(), item)
				break
			case 'Delete':
				this.delete(item)
				break
			case 'Backspace':
				this.cancelSearch()
				break
		}
	}
}

// 列表 - 指针按下事件
Variable.listPointerdown = function (event) {
	switch (event.button) {
		case 3:
			this.cancelSearch()
			break
	}
}

// 面板 - 键盘按下事件
Variable.panelKeydown = function (event) {
	switch (event.target.tagName) {
		case 'INPUT':
		case 'TEXTAREA':
			if (event.cmdOrCtrlKey) {
				switch (event.code) {
					case 'Enter':
					case 'NumpadEnter':
						break
					default:
						event.stopPropagation()
						break
				}
			}
			break
	}
}

// 搜索框 - 输入事件
Variable.searcherInput = function (event) {
	if (event.inputType === 'insertCompositionText') {
		return
	}
	const text = this.input.value
	Variable.list.searchNodes(text)
}
