import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { TextAreaVar } from '@/components/textarea-var.ts';
import { Command } from '@/command/command-object.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CustomBox } from '@/components/custom-box.ts';
import { NumberVar } from '@/components/number-var.ts';
import { SelectBox } from '@/components/select-box.ts';
import { Data } from '@/data/data-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';
import { Selection } from '@/tools/text-capture.ts';

(Command.cases as any).callEvent = new CommandSchema({
	name: 'callEvent',
	windowFrame: $('#callEvent'),
	gridBox: $('#callEvent').querySelector('grid-box'),
	eventArgs: [],
	parameters: [],
	eventResult: null,
	onInitialize() {
		$('#callEvent-confirm').on('click', () => this.save());

		$('#callEvent-type').loadItems([
			{ name: 'Global', value: 'global' },
			{ name: 'Inherited', value: 'inherited' },
			{ name: 'Scene', value: 'scene' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Light', value: 'light' },
			{ name: 'Element', value: 'element' }
		]);

		$('#callEvent-type')
			.enableHiddenMode()
			.relate([
				{ case: 'global', targets: [$('#callEvent-eventId')] },
				{ case: 'scene', targets: [$('#callEvent-eventType')] },
				{
					case: 'actor',
					targets: [$('#callEvent-actor'), $('#callEvent-eventType')]
				},
				{
					case: 'skill',
					targets: [$('#callEvent-skill'), $('#callEvent-eventType')]
				},
				{
					case: 'state',
					targets: [$('#callEvent-state'), $('#callEvent-eventType')]
				},
				{
					case: 'equipment',
					targets: [$('#callEvent-equipment'), $('#callEvent-eventType')]
				},
				{
					case: 'item',
					targets: [$('#callEvent-item'), $('#callEvent-eventType')]
				},
				{
					case: 'light',
					targets: [$('#callEvent-light'), $('#callEvent-eventType')]
				},
				{
					case: 'element',
					targets: [$('#callEvent-element'), $('#callEvent-eventType')]
				}
			]);

		this.windowFrame.on('closed', () => {
			this.eventArgs = [];
			this.clearGlobalEventElements();
		});

		$('#callEvent-type').on('write', (event) => {
			const type = event.value;
			if (type !== 'inherited') {
				const elEventType = $('#callEvent-eventType');
				const eventTypes = Enum.getMergedItems(EventEditor.types[type], type + '-event');
				elEventType.loadItems(eventTypes);
				elEventType.createTooltip();
				elEventType.write(eventTypes[0].value);
			}
			for (const element of $('.call-event-component')) {
				if (type === 'global') {
					element.show();
				} else {
					element.hide();
				}
			}
			this.resizeWindow();
		});

		$('#callEvent-eventId').on('write', (event) => {
			this.eventArgs = this.readEventArgs();
			this.clearGlobalEventElements();
			const id = event.value;
			if (id !== '') {
				const flags = {};
				const globalEvent = Data.events[id];
				for (const parameter of globalEvent.parameters) {
					if (parameter.key in flags) {
						continue;
					}
					flags[parameter.key] = true;
					this.createParameterElements(parameter);
				}
				this.createEventResultElements(globalEvent.returnType);
			}
			this.resizeWindow();
		});

		$('#callEvent-eventId').on('input', () => {
			this.writeEventArgs(this.eventArgs);
		});
	},
	resizeWindow() {
		this.windowFrame.style.height = `${this.gridBox.clientHeight + 78}px`;
	},
	clearGlobalEventElements() {
		const { parameters } = this;
		if (parameters.length !== 0) {
			for (const { label, input } of parameters) {
				label.remove();
				input.remove();
			}
			parameters.length = 0;
		}
		const { eventResult } = this;
		if (eventResult) {
			eventResult.label.remove();
			eventResult.input.remove();
			this.eventResult = null;
		}
	},
	createParameterElements(parameter: any) {
		const { type, key, note } = parameter;
		const label = document.createElement('text');
		const name = key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
		label.textContent = name;
		let input;
		switch (type) {
			case 'boolean':
				input = new SelectBox();
				input.loadItems([
					{ name: 'False', value: false },
					{ name: 'True', value: true }
				]);
				break;
			case 'number':
				input = new NumberVar();
				input.numBox.input.min = '-1000000000';
				input.numBox.input.max = '1000000000';
				input.numBox.decimals = 10;
				break;
			case 'string':
				input = new TextAreaVar();
				input.strBox.setAttribute(
					'menu',
					'tag-local-var tag-global-var tag-dynamic-global-var tag-localization'
				);
				input.addClass('callEvent-argument-string');
				input.on('change', () => this.resizeWindow());
				Selection.addEventListeners(input.strBox);
				break;
			case 'object':
				input = new CustomBox();
				input.type = 'variable';
				input.filter = 'object';
				break;
			case 'actor':
				input = new CustomBox();
				input.type = 'actor';
				break;
			case 'skill':
				input = new CustomBox();
				input.type = 'skill';
				break;
			case 'state':
				input = new CustomBox();
				input.type = 'state';
				break;
			case 'equipment':
				input = new CustomBox();
				input.type = 'equipment';
				break;
			case 'item':
				input = new CustomBox();
				input.type = 'item';
				break;
			case 'trigger':
				input = new CustomBox();
				input.type = 'trigger';
				break;
			case 'light':
				input = new CustomBox();
				input.type = 'light';
				break;
			case 'element':
				input = new CustomBox();
				input.type = 'element';
				break;
		}
		if (note) {
			input.setTooltip(`<b>${name}</b>\n${note}`);
		}
		label.addClass('call-event-component');
		input.addClass('call-event-component');
		this.gridBox.appendChild(label);
		this.gridBox.appendChild(input);
		this.parameters.push({ key, type, label, input });
	},
	createEventResultElements(type: any) {
		let input;
		switch (type) {
			case 'none':
				return;
			case 'boolean':
				input = new CustomBox();
				input.type = 'variable';
				input.filter = 'boolean';
				break;
			case 'number':
				input = new CustomBox();
				input.type = 'variable';
				input.filter = 'number';
				break;
			case 'string':
				input = new CustomBox();
				input.type = 'variable';
				input.filter = 'string';
				break;
			case 'object':
				input = new CustomBox();
				input.type = 'variable';
				input.filter = 'object';
				break;
			case 'actor':
			case 'skill':
			case 'state':
			case 'equipment':
			case 'item':
			case 'trigger':
			case 'light':
			case 'element':
				input = new CustomBox();
				input.type = 'variable';
				input.filter = 'object';
				break;
		}
		input.write({ type: 'local', key: '' });
		const label = document.createElement('text');
		const text = Local.get('command.callEvent.return');
		const tip = Local.get('command.callEvent.return.tip');
		label.textContent = text;
		input.setTooltip(`<b>${text}</b>\n${tip}`);
		label.addClass('call-event-component');
		input.addClass('call-event-component');
		this.gridBox.appendChild(label);
		this.gridBox.appendChild(input);
		this.eventResult = { type, label, input };
	},
	parseEventArgs(event: any, args: any) {
		const words = Command.words;
		if (event) {
			const flags = {};
			const parameters = event.parameters;
			outer: for (const { type, key, note } of parameters) {
				const name = note ? Command.setTooltip(`<b>${key}</b>\n${note}`) + key : key;
				for (const arg of args) {
					if (arg.key === key && arg.type === type) {
						if (key in flags) {
							continue;
						}
						flags[key] = true;
						words.push(name + Token(' = ') + this.parseEventArgInput(arg));
						continue outer;
					}
				}
				const info = `${(Command as any).setClass('error')}${name}${
					Token(': ') + Command.setWeakColor(Local.get('eventParameterTypes.' + type))
				}`;
				words.push(info);
			}
		}
		let info = words.join();
		if (info) info = `(${info})`;
		return info;
	},
	parseEventArgInput(arg: any) {
		switch (arg.type) {
			case 'boolean':
				return Command.setBooleanColor(arg.value.toString());
			case 'number':
				return Command.parseVariableNumber(arg.value);
			case 'string':
				return Command.parseVariableTemplate(arg.value, 40);
			case 'object':
				return Command.parseVariable(arg.value, 'object');
			case 'actor':
				return Command.parseActor(arg.value);
			case 'skill':
				return Command.parseSkill(arg.value);
			case 'state':
				return Command.parseState(arg.value);
			case 'equipment':
				return Command.parseEquipment(arg.value);
			case 'item':
				return Command.parseItem(arg.value);
			case 'trigger':
				return Command.parseTrigger(arg.value);
			case 'light':
				return Command.parseLight(arg.value);
			case 'element':
				return Command.parseElement(arg.value);
		}
	},
	getDefaultArgValue(type: any) {
		switch (type) {
			case 'boolean':
				return false;
			case 'number':
				return 0;
			case 'string':
				return '';
			case 'object':
				return { type: 'local', key: '' };
			case 'actor':
			case 'skill':
			case 'state':
			case 'equipment':
			case 'item':
			case 'trigger':
			case 'light':
			case 'element':
				return { type: 'trigger' };
		}
	},
	writeEventArgs(args: any) {
		outer: for (const { type, key, input } of this.parameters) {
			for (const arg of args) {
				if (arg.key === key && arg.type === type) {
					input.write(arg.value);
					continue outer;
				}
			}
			input.write(this.getDefaultArgValue(type));
		}
	},
	readEventArgs() {
		const args = [];
		for (const { type, key, input } of this.parameters) {
			const value = input.read();
			if (type === 'object' && VariableGetter.isNone(value)) {
				input.getFocus();
				return null;
			}
			args.push({ type, key, value });
		}
		return args;
	},
	writeEventResult(eventResult: any) {
		if (this.eventResult === null) return;
		if (eventResult.type === 'none') return;
		const baseTypes = 'boolean|number|string';
		const objectTypes = 'actor|skill|state|equipment|item|trigger|light|element|any';
		if (
			eventResult.type === this.eventResult.type ||
			(baseTypes.includes(eventResult.type) &&
				baseTypes.includes(this.eventResult.type) &&
				eventResult.variable.type === 'local') ||
			(objectTypes.includes(eventResult.type) && objectTypes.includes(this.eventResult.type))
		) {
			this.eventResult.input.write(eventResult.variable);
		}
	},
	readEventResult() {
		const eventResult: any = { type: 'none' };
		if (this.eventResult !== null) {
			eventResult.type = this.eventResult.type;
			eventResult.variable = this.eventResult.input.read();
		}
		return eventResult;
	},
	customParse({
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		light,
		element,
		eventId,
		eventArgs,
		eventResult,
		eventType
	}) {
		const words = Command.words;
		switch (type) {
			case 'global': {
				if (eventArgs === undefined) {
					eventArgs = [];
				}
				if (eventResult === undefined) {
					eventResult = { type: 'none' };
				}
				let leftValue = '';
				let eventName = Command.parseFileName(eventId);
				const event = Data.events[eventId];
				if (!event) break;
				switch (eventResult.type) {
					case 'none':
						if (event.returnType !== 'none') {
							leftValue = Command.setVariableColor('?');
						}
						break;
					case 'boolean':
					case 'number':
					case 'string':
						leftValue = Command.parseVariable(
							eventResult.variable,
							eventResult.type,
							true
						);
						break;
					case 'object':
						leftValue = Command.parseVariable(eventResult.variable, 'object', true);
						break;
					case 'actor':
					case 'skill':
					case 'state':
					case 'equipment':
					case 'item':
					case 'trigger':
					case 'light':
					case 'element':
						leftValue = Command.parseVariable(eventResult.variable, 'object', true);
						break;
				}
				if (leftValue) {
					if (eventResult.type !== event.returnType) {
						leftValue = (Command as any).setClass('error') + leftValue;
					}
					leftValue += Token(' = ');
				}
				if (event.description) {
					eventName =
						Command.setTooltip(
							`<b>${Command.removeTextTags(eventName)}</b>\n${event.description}`
						) + eventName;
				}
				words.push(leftValue + eventName + this.parseEventArgs(event, eventArgs));
				break;
			}
			case 'inherited':
				words.push(Local.get('command.callEvent.inherited'));
				break;
			case 'scene':
				words.push(Local.get('command.callEvent.scene'));
				break;
			case 'actor':
				words.push(Command.parseActor(actor));
				break;
			case 'skill':
				words.push(Command.parseSkill(skill));
				break;
			case 'state':
				words.push(Command.parseState(state));
				break;
			case 'equipment':
				words.push(Command.parseEquipment(equipment));
				break;
			case 'item':
				words.push(Command.parseItem(item));
				break;
			case 'light':
				words.push(Command.parseLight(light));
				break;
			case 'element':
				words.push(Command.parseElement(element));
				break;
		}
		if (eventType) {
			words.push(Command.parseEventType(type + '-event', eventType));
		}
		const contents: any[] = [
			{ color: 'flow' },
			{ text: Local.get('command.callEvent.alias') + Token(': ') },
			{ text: words.join() }
		];
		if (type === 'global') {
			contents.unshift({ class: 'parent:global-event' });
		}
		return contents;
	},
	customLoad({
		type = 'global',
		actor = { type: 'trigger' },
		skill = { type: 'trigger' },
		state = { type: 'trigger' },
		equipment = { type: 'trigger' },
		item = { type: 'trigger' },
		light = { type: 'trigger' },
		element = { type: 'trigger' },
		eventId = '',
		eventArgs = [],
		eventResult = { type: 'none' },
		eventType = ''
	}) {
		const write = getElementWriter('callEvent');
		write('type', type);
		write('actor', actor);
		write('skill', skill);
		write('state', state);
		write('equipment', equipment);
		write('item', item);
		write('light', light);
		write('element', element);
		write('eventId', eventId);
		write('eventType', eventType);
		this.writeEventArgs(eventArgs);
		this.writeEventResult(eventResult);
		$('#callEvent-type').getFocus();
	},
	customSave() {
		const read = getElementReader('callEvent');
		const type = read('type');
		switch (type) {
			case 'global': {
				const eventId = read('eventId');
				if (eventId === '') {
					return $('#callEvent-eventId').getFocus();
				}
				const eventArgs = this.readEventArgs();
				if (eventArgs === null) return;
				const eventResult = this.readEventResult();
				if (eventResult.type !== 'none' && VariableGetter.isNone(eventResult.variable)) {
					return this.eventResult.input.getFocus();
				}
				Command.save({ type, eventId, eventArgs, eventResult });
				break;
			}
			case 'inherited':
				Command.save({ type });
				break;
			case 'scene':
				const eventType = read('eventType');
				if (eventType === '') {
					return $('#callEvent-eventType').getFocus();
				}
				Command.save({ type, eventType });
				break;
			default: {
				const target = read(type);
				const eventType = read('eventType');
				if (eventType === '') {
					return $('#callEvent-eventType').getFocus();
				}
				Command.save({
					type: type,
					[type]: target,
					eventType: eventType
				});
				break;
			}
		}
	}
});
