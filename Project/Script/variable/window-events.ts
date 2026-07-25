import { Window } from '@/tools/window-object.ts';
import { Reference } from '@/log/related-references.ts';
import { Local } from '@/tools/localization.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
import { Variable } from './variable.ts';

Variable.windowClose = function (event) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedVariables')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close('variable');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Variable);

Variable.windowClosed = function (event) {
	this.target = null;
	this.data = null;
	this.idMap = null;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null;
	this.searcher.write('');
	this.list.clear();
	this.closePropertyPanel();
	window.off('keydown', this.keydown);
	window.off('keydown', Reference.getKeydownListener(this.list));
}.bind(Variable);
