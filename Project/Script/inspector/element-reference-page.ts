import { $, getElementWriter } from '@/util/dom.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIReference = {
		owner: UI,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	UIReference.initialize = function () {
		const elements = $('#uiReference-prefabId, #uiReference-synchronous');
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, UI));
	};

	UIReference.create = function () {
		const transform = Inspector.uiElement.createTransform();
		transform.width = 100;
		transform.height = 100;
		return {
			class: 'reference',
			name: 'Reference',
			enabled: true,
			expanded: false,
			hidden: false,
			locked: false,
			presetId: '',
			prefabId: '',
			synchronous: false,
			transform: transform,
			events: [],
			scripts: [],
			children: []
		};
	};

	UIReference.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiReference', node);
			write('prefabId');
			write('synchronous');
			Inspector.uiElement.open(node);
		}
	};

	UIReference.close = function () {
		if (this.target) {
			UI.list.unselect(this.target);
			UI.updateTarget();
			Inspector.uiElement.close();
			this.target = null;
		}
	};

	UIReference.update = function (node, key, value) {
		UI.planToSave();
		// const element = node.instance
		switch (key) {
			case 'prefabId':
				if (node[key] !== value) {
					node[key] = value;
					// element[key] = value
					node.instance.historyEnabled = true;
					node.instances.setProperty(key, value);
					node.instance.historyEnabled = false;
					UI.list.updateIcon(node);
				}
				break;
			case 'synchronous':
				if (node[key] !== value) {
					node[key] = value;
					node.instance.historyEnabled = true;
					node.instances.setProperty(key, value);
					node.instance.historyEnabled = false;
				}
				break;
		}
		UI.requestRendering();
	};

	UIReference.paramInput = function () {
		UIReference.update(UIReference.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiReference = UIReference;
}
