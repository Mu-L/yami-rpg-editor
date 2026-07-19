import { ctrl } from '../util/event-accessors.js'
import { Menu } from '../components/menu-list.js'
import { Reference } from '../log/related-references.js'
import { Local } from '../tools/localization.js'
import { Variable } from './variable.js'

// 列表 - 选择事件
Variable.listSelect = function (event) {
	const item = event.value
	return item.class !== 'folder'
		? Variable.openPropertyPanel(item)
		: Variable.closePropertyPanel()
}

// 列表 - 记录事件
Variable.listRecord = function (event) {
	Variable.changed = true
	const response = event.value
	switch (response.type) {
		case 'rename': {
			// 如果是变量则执行操作否则进入默认分支
			const { item, oldValue, newValue } = response
			if (Variable.panel.variable === item) {
				Variable.inputs.name.write(newValue)
				Variable.saveHistory(item, 'name', oldValue)
				break
			}
		}
		default:
			Variable.history.save({
				type: 'variable-list-operation',
				response: response
			})
			break
	}
}

// 列表 - 菜单弹出事件
Variable.listPopup = function (event) {
	const item = event.value
	const selected = !!item
	const copyable = selected && item.class !== 'folder'
	const pastable = Clipboard.has('yami.data.variable')
	const undoable = Variable.history.canUndo()
	const redoable = Variable.history.canRedo()
	const get = Local.createGetter('menuVariableList')
	const items = [
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.folder'),
					click: () => {
						this.addNodeTo(this.createFolder(), item)
					}
				},
				{
					label: get('create.variable'),
					accelerator: 'Insert',
					click: () => {
						this.addNodeTo(this.createVariable(), item)
					}
				}
			]
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: copyable,
			click: () => {
				this.copy(item)
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				this.paste(item)
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: selected,
			click: () => {
				this.delete(item)
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: selected,
			click: () => {
				this.rename(item)
			}
		},
		{
			label: get('undo'),
			accelerator: ctrl('Z'),
			enabled: undoable,
			click: () => {
				Variable.undo()
			}
		},
		{
			label: get('redo'),
			accelerator: ctrl('Y'),
			enabled: redoable,
			click: () => {
				Variable.redo()
			}
		}
	]
	if (copyable) {
		items.unshift({
			label: `ID: ${item.id}`,
			style: 'id',
			click: () => {
				navigator.clipboard.writeText(item.id)
			}
		})
		items.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			click: () => {
				Reference.openRelated(item.id)
			}
		})
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		items
	)
}

// 列表 - 打开事件
Variable.listOpen = function (event) {
	if (event.value.class !== 'folder' && Variable.target instanceof Object) {
		Variable.target.getFocus?.()
		Variable.confirm()
	}
}
