import { Window } from '../tools/window-object.js'
import { Reference } from '../log/related-references.js'
import { Local } from '../tools/localization.js'
import { UndoManager } from '../tools/undo-manager.js'
import { Variable } from './variable.js'

// 窗口 - 关闭事件
Variable.windowClose = function (event) {
	this.list.saveScroll()
	if (this.changed) {
		event.preventDefault()
		const get = Local.createGetter('confirmation')
		Window.confirm(
			{
				message: get('closeUnsavedVariables')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false
						Window.close('variable')
					}
				},
				{
					label: get('no')
				}
			]
		)
	}
}.bind(Variable)

// 窗口 - 已关闭事件
Variable.windowClosed = function (event) {
	this.target = null
	this.data = null
	this.idMap = null
	UndoManager.setActive(this._previousActive)
	this._previousActive = null
	this.history = null
	this.searcher.write('')
	this.list.clear()
	this.closePropertyPanel()
	window.off('keydown', this.keydown)
	window.off('keydown', Reference.getKeydownListener(this.list))
}.bind(Variable)
