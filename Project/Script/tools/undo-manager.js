export const UndoManager = {
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
		return this.active?.history?.canUndo() ?? false
	},

	canRedo() {
		return this.active?.history?.canRedo() ?? false
	}
}
