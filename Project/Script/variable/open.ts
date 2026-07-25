import { $ } from '../util/dom.ts';
import { Data } from '../data/data-object.ts';
import { File } from '../file/file-system-core.ts';
import { Reference } from '../log/related-references.ts';
import { History } from '../tools/history.ts';
import { UndoManager } from '../tools/undo-manager.ts';
import { Window } from '../tools/window-object.ts';
import { Variable } from './variable.ts';

Variable.open = function (target = null) {
	this.target = target;
	this._previousActive = UndoManager.getActive();
	this.history = new History(100);
	UndoManager.setActive(this);
	this.unpackVariables();
	Window.open('variable');

	const list = this.list;
	const item = !target ? undefined : this.getVariableById(target.read());
	if (item && item.class !== 'folder') {
		list.initialize();
		list.select(item);
		list.expandToSelection(false);
		list.update();
		list.restoreScroll();
		list.scrollToSelection('middle');
	} else {
		list.update();
		list.restoreScroll();
		if (target instanceof Object) {
			list.select(list.data[0]);
		}
	}

	list.getFocus();

	window.on('keydown', this.keydown);
	window.on('keydown', Reference.getKeydownListener(list, 'variable'));
};

Variable.undo = function () {
	if (this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Variable.redo = function () {
	if (this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Variable.confirm = function (event) {
	const target = this.target;
	if (target instanceof Object) {
		const variable = this.panel.variable;
		if (variable === null) {
			return this.list.getFocus();
		}
		const filter = target.filter;
		switch (filter) {
			case 'boolean':
			case 'number':
			case 'string':
			case 'object':
				if (typeof variable.value !== filter) {
					return $(`#variable-type-${filter}`).getFocus();
				}
				break;
		}
		this.apply();
		target.input(variable.id);
	} else {
		this.apply();
	}
	Window.close('variable');
}.bind(Variable);

Variable.apply = function (event) {
	if (this.changed) {
		this.changed = false;

		this.packVariables();
		File.planToSave(Data.manifest.project.variables);

		window.dispatchEvent(new Event('variablechange'));
	}
}.bind(Variable);
