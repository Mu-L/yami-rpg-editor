'use strict'

const UndoManager = {
	active: null,

	setActive(editor) {
		this.active = editor
	},

	getActive() {
		return this.active
	},

	undo() {
		this.active?.undo()
	},

	redo() {
		this.active?.redo()
	},

	canUndo() {
		return this.active?.canUndo() ?? false
	},

	canRedo() {
		return this.active?.canRedo() ?? false
	}
}
