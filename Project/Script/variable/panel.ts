import { $ } from '@/util/dom.ts';
import { Variable } from './variable.ts';

Variable.openPropertyPanel = function (variable) {
	const panel = this.panel;
	if (panel.variable !== variable) {
		panel.variable = variable;
		panel.show();
		const { inputs } = this;
		const { name, sort, value, note } = variable;
		const type = typeof value;
		inputs.name.write(name);
		inputs.sort.write(sort);
		inputs.type.write(type);
		inputs.boolean.write(type === 'boolean' ? value : false);
		inputs.number.write(type === 'number' ? value : 0);
		inputs.string.write(type === 'string' ? value : '');
		inputs.note.write(note);
	}
};

Variable.closePropertyPanel = function () {
	const panel = this.panel;
	if (panel.variable) {
		panel.variable = null;
		panel.hide();
	}
};

Variable.nameInput = function (event) {
	const item = Variable.panel.variable;
	if (item.class !== 'folder') {
		Variable.saveHistory(item, 'name', item.name);
		item.name = event.target.value;
		Variable.list.updateItemName(item);
		Variable.changed = true;
	}
};

Variable.sortWrite = function (event) {
	switch (event.value) {
		case 0:
		case 1:
			$('#variable-type-object').disable();
			break;
		case 2:
			$('#variable-type-object').enable();
			break;
	}
};

Variable.sortInput = function (event) {
	const item = Variable.panel.variable;
	const sort = event.value;
	Variable.saveHistory(item, 'sort', {
		sort: item.sort,
		value: item.value
	});
	// 如果从临时变量对象类型切换到其他分类，修改变量的值为布尔值
	if (item.value === null) {
		item.value = Variable.inputs.boolean.read();
		Variable.inputs.type.write('boolean');
		Variable.list.updateIcon(item);
		Variable.list.updateInitText(item);
	}
	item.sort = sort;
	Variable.list.updateItemClass(item);
	Variable.changed = true;
};

Variable.typeWrite = function (event) {
	const { style } = Variable.inputs.value;
	Variable.manager.switch(event.value);
	switch (event.value) {
		case 'boolean':
		case 'number':
		case 'string':
			style.visibility = 'visible';
			break;
		case 'object':
			style.visibility = 'hidden';
			break;
	}
};

Variable.typeInput = function (event) {
	const item = Variable.panel.variable;
	const type = event.value;
	Variable.saveHistory(item, 'type', item.value);
	switch (type) {
		case 'boolean':
		case 'number':
		case 'string':
			item.value = Variable.inputs[type].read();
			break;
		case 'object':
			item.value = null;
			break;
	}
	Variable.list.updateIcon(item);
	Variable.list.updateInitText(item);
	Variable.changed = true;
};

Variable.valueInput = function (event) {
	if (event.inputType !== 'insertCompositionText') {
		const item = Variable.panel.variable;
		Variable.saveHistory(item, 'value', item.value);
		item.value = this.read();
		Variable.list.updateInitText(item);
		Variable.changed = true;
	}
};

Variable.noteInput = function (event) {
	if (event.inputType !== 'insertCompositionText') {
		const item = Variable.panel.variable;
		Variable.saveHistory(item, 'note', item.note);
		item.note = this.read();
		Variable.list.updateNoteIcon(item);
		Variable.changed = true;
	}
};
