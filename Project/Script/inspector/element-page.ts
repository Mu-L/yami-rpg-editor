import { $, getElementWriter } from '@/util/dom.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const UIElement = {
		owner: UI,
		target: null,
		synchronous: false,
		nameBox: $('#uiElement-name'),
		pointerEvents: $('#uiElement-pointerEvents'),
		generalGroup: $('#uiElement-general-group'),
		transformGroup: $('#uiElement-transform-group'),
		eventsGroup: $('#uiElement-events-group'),
		scriptsGroup: $('#uiElement-scripts-group'),
		parameterPane: $('#uiElement-parameter-pane'),
		initialize: null,
		createTransform: null,
		lockSizeInputs: null,
		unlockSizeInputs: null,
		open: null,
		close: null,
		write: null,
		update: null,
		pageSwitch: null,
		alignmentClick: null,
		paramInput: null
	};

	UIElement.initialize = function () {
		this.pointerEvents.loadItems([
			{ name: 'Enabled', value: 'enabled' },
			{ name: 'Disabled', value: 'disabled' },
			{ name: 'Skipped', value: 'skipped' }
		]);

		$('#uiElement-events').bind(new EventListInterface(this, UI));

		$('#uiElement-scripts').bind(new ScriptListInterface(this, UI));

		this.parameterPane.bind($('#uiElement-scripts'));

		// this.generalGroup.remove() this.transformGroup.remove() this.eventsGroup.remove() this.scriptsGroup.remove()

		Inspector.manager.on('switch', this.pageSwitch);
		const alignElements = $('.uiElement-transform-align');
		const otherElements = $(`#uiElement-name,
    #uiElement-pointerEvents, #uiElement-transform-anchorX, #uiElement-transform-anchorY,
    #uiElement-transform-x, #uiElement-transform-x2, #uiElement-transform-y, #uiElement-transform-y2,
    #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
    #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
    #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`);
		alignElements.on('click', this.alignmentClick);
		otherElements.on('input', this.paramInput);
		otherElements.on('focus', Inspector.inputFocus);
		otherElements.on('blur', Inspector.inputBlur(this, UI));
		$('#uiElement-events, #uiElement-scripts').on('change', UI.listChange);
	};

	UIElement.createTransform = function () {
		return {
			anchorX: 0,
			anchorY: 0,
			x: 0,
			x2: 0,
			y: 0,
			y2: 0,
			width: 0,
			width2: 0,
			height: 0,
			height2: 0,
			rotation: 0,
			scaleX: 1,
			scaleY: 1,
			skewX: 0,
			skewY: 0,
			opacity: 1
		};
	};

	UIElement.lockSizeInputs = function () {
		if (!this.synchronous) {
			this.synchronous = true;
			$(`#uiElement-transform-anchorX, #uiElement-transform-anchorY,
      #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
      #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
      #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`).disable();
		}
	};

	UIElement.unlockSizeInputs = function () {
		if (this.synchronous) {
			this.synchronous = false;
			$(`#uiElement-transform-anchorX, #uiElement-transform-anchorY,
      #uiElement-transform-width, #uiElement-transform-width2, #uiElement-transform-height, #uiElement-transform-height2,
      #uiElement-transform-rotation, #uiElement-transform-scaleX, #uiElement-transform-scaleY,
      #uiElement-transform-skewX, #uiElement-transform-skewY, #uiElement-transform-opacity`).enable();
		}
	};

	UIElement.open = function (node) {
		if (this.target !== node) {
			this.target = node;

			const write = getElementWriter('uiElement', node);
			write('name');
			if (node.pointerEvents) {
				this.pointerEvents.show();
				this.pointerEvents.previousElementSibling.show();
				write('pointerEvents');
			} else {
				this.pointerEvents.hide();
				this.pointerEvents.previousElementSibling.hide();
			}
			if (node.class === 'reference' && node.synchronous) {
				this.lockSizeInputs();
			} else {
				this.unlockSizeInputs();
			}
			write('transform-anchorX');
			write('transform-anchorY');
			write('transform-x');
			write('transform-x2');
			write('transform-y');
			write('transform-y2');
			write('transform-width');
			write('transform-width2');
			write('transform-height');
			write('transform-height2');
			write('transform-rotation');
			write('transform-scaleX');
			write('transform-scaleY');
			write('transform-skewX');
			write('transform-skewY');
			write('transform-opacity');
			write('events');
			write('scripts');
		}
	};

	UIElement.close = function () {
		if (this.target) {
			this.target = null;
			$('#uiElement-events').clear();
			$('#uiElement-scripts').clear();
			$('#uiElement-parameter-pane').clear();
		}
	};

	UIElement.write = function (options) {
		if (options.anchorX !== undefined) {
			$('#uiElement-transform-anchorX').write(options.anchorX);
		}
		if (options.anchorY !== undefined) {
			$('#uiElement-transform-anchorY').write(options.anchorY);
		}
		if (options.x !== undefined) {
			$('#uiElement-transform-x').write(options.x);
		}
		if (options.x2 !== undefined) {
			$('#uiElement-transform-x2').write(options.x2);
		}
		if (options.y !== undefined) {
			$('#uiElement-transform-y').write(options.y);
		}
		if (options.y2 !== undefined) {
			$('#uiElement-transform-y2').write(options.y2);
		}
		if (options.width !== undefined) {
			$('#uiElement-transform-width').write(options.width);
		}
		if (options.width2 !== undefined) {
			$('#uiElement-transform-width2').write(options.width2);
		}
		if (options.height !== undefined) {
			$('#uiElement-transform-height').write(options.height);
		}
		if (options.height2 !== undefined) {
			$('#uiElement-transform-height2').write(options.height2);
		}
		if (options.rotation !== undefined) {
			$('#uiElement-transform-rotation').write(options.rotation);
		}
		if (options.scaleX !== undefined) {
			$('#uiElement-transform-scaleX').write(options.scaleX);
		}
		if (options.scaleY !== undefined) {
			$('#uiElement-transform-scaleY').write(options.scaleY);
		}
		if (options.skewX !== undefined) {
			$('#uiElement-transform-skewX').write(options.skewX);
		}
		if (options.skewY !== undefined) {
			$('#uiElement-transform-skewY').write(options.skewY);
		}
		if (options.opacity !== undefined) {
			$('#uiElement-transform-opacity').write(options.opacity);
		}
	};

	UIElement.update = function (node, key, value) {
		UI.planToSave();
		const transform = node.transform;
		switch (key) {
			case 'name':
				if (node.name !== value) {
					node.name = value;
					UI.list.updateItemName(node);
				}
				break;
			case 'pointerEvents':
				if (node.pointerEvents !== value) {
					node.pointerEvents = value;
				}
				break;
			case 'transform-anchorX':
			case 'transform-anchorY':
			case 'transform-x':
			case 'transform-x2':
			case 'transform-y':
			case 'transform-y2':
			case 'transform-width':
			case 'transform-width2':
			case 'transform-height':
			case 'transform-height2':
			case 'transform-rotation':
			case 'transform-scaleX':
			case 'transform-scaleY':
			case 'transform-skewX':
			case 'transform-skewY':
			case 'transform-opacity': {
				const index = key.indexOf('-') + 1;
				const property = key.slice(index);
				if (transform[property] !== value) {
					// transform[property] = value element.resize()
					node.instances.setProperty(key, value);
					node.instances.resize();
				}
				break;
			}
		}
		UI.requestRendering();
	};

	UIElement.pageSwitch = function (event) {
		switch (event.value) {
			case 'uiImage':
			case 'uiText':
			case 'uiTextBox':
			case 'uiDialogBox':
			case 'uiProgressBar':
			case 'uiButton':
			case 'uiAnimation':
			case 'uiVideo':
			case 'uiWindow':
			case 'uiContainer':
			case 'uiReference': {
				const page = Inspector.manager.active;
				page.insertBefore(this.transformGroup, page.firstChild);
				page.insertBefore(this.generalGroup, page.firstChild);
				page.appendChild(this.eventsGroup);
				page.appendChild(this.scriptsGroup);
				page.appendChild(this.parameterPane);
				break;
			}
		}
	}.bind(UIElement);

	UIElement.alignmentClick = function () {
		let x;
		let y;
		switch (this.getAttribute('value')) {
			case 'left':
				x = 0;
				break;
			case 'center':
				x = 0.5;
				break;
			case 'right':
				x = 1;
				break;
			case 'top':
				y = 0;
				break;
			case 'middle':
				y = 0.5;
				break;
			case 'bottom':
				y = 1;
				break;
		}
		const node = UIElement.target;
		const elements = node.instances;
		const transform = node.transform;
		const changes = [];
		if (x !== undefined) {
			if (transform.anchorX !== x) {
				const input = $('#uiElement-transform-anchorX');
				changes.push({
					input: input,
					oldValue: transform.anchorX,
					newValue: x
				});
				// transform.anchorX = x
				elements.set('transform-anchorX', x);
				input.write(x);
			}
			if (transform.x !== 0) {
				const input = $('#uiElement-transform-x');
				changes.push({
					input: input,
					oldValue: transform.x,
					newValue: 0
				});
				// transform.x = 0
				elements.set('transform-x', 0);
				input.write(0);
			}
			if (transform.x2 !== x) {
				const input = $('#uiElement-transform-x2');
				changes.push({
					input: input,
					oldValue: transform.x2,
					newValue: x
				});
				// transform.x2 = x
				elements.set('transform-x2', x);
				input.write(x);
			}
		}
		if (y !== undefined) {
			if (transform.anchorY !== y) {
				const input = $('#uiElement-transform-anchorY');
				changes.push({
					input: input,
					oldValue: transform.anchorY,
					newValue: y
				});
				// transform.anchorY = y
				elements.set('transform-anchorY', y);
				input.write(y);
			}
			if (transform.y !== 0) {
				const input = $('#uiElement-transform-y');
				changes.push({
					input: input,
					oldValue: transform.y,
					newValue: 0
				});
				// transform.y = 0
				elements.set('transform-y', 0);
				input.write(0);
			}
			if (transform.y2 !== y) {
				const input = $('#uiElement-transform-y2');
				changes.push({
					input: input,
					oldValue: transform.y2,
					newValue: y
				});
				// transform.y2 = y
				elements.set('transform-y2', y);
				input.write(y);
			}
		}
		if (changes.length !== 0) {
			elements.resize();
			UI.planToSave();
			UI.requestRendering();
			UI.history.save({
				type: 'inspector-change',
				editor: UIElement,
				target: UIElement.target,
				changes: changes
			});
		}
	};

	UIElement.paramInput = function () {
		UIElement.update(UIElement.target, Inspector.getKey(this), this.read());
	};

	Inspector.uiElement = UIElement;
}
