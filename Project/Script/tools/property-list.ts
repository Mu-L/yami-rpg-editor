import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { Command } from '@/command/command-object.ts';
import { SelectBox } from '@/components/select-box.ts';
import { Enum } from '@/enum/enum-window.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { GameLocal } from '@/local/local-object.ts';
import { Window } from './window-object.ts';

import { IListInterface } from '@/types/list-interface.ts';

export class AttributeListInterface implements IListInterface {
	target: HTMLElement | null;
	type: string;
	group: string;
	history: any | null;
	editor: any | null;
	owner: any | null;

	constructor(editor?: any, owner?: any) {
		this.editor = editor ?? null;
		this.owner = owner ?? null;
	}

	initialize(list: HTMLElement): void {
		this.target = null;
		this.type = 'object-attribute';
		this.group = list.getAttribute('group');

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory(editor, owner, list);
		}
	}

	parse(item: any): any {
		if (item instanceof Object) {
			let { key, value } = item;
			if (typeof value === 'string') {
				value = Command.parseMultiLineString(value);
			}
			const attr = Attribute.getGroupAttribute(this.group, key);
			let attrName = '';
			let attrClass = '';
			let valueClass = '';
			switch (attr?.type) {
				case 'boolean':
				case 'number':
				case 'string':
					attrName = attr.name;
					if (typeof value !== attr.type) {
						valueClass = 'invalid';
					}
					if (typeof value === 'string') {
						value = GameLocal.replace(value);
					}
					break;
				case 'enum': {
					attrName = attr.name;
					const item = Enum.getGroupString(attr.enum, value);
					if (item) {
						value = item.name;
					} else {
						value = Command.parseUnlinkedId(value);
						valueClass = 'invalid';
					}
					break;
				}
				case undefined:
					attrName = Command.parseUnlinkedId(key);
					attrClass = 'invalid';
					break;
			}
			attrName = GameLocal.replace(attrName);
			return [
				{ content: attrName, class: attrClass },
				{ content: value, class: valueClass }
			];
		}
		return item;
	}

	open(item: any = { key: '', value: 0 }) {
		Window.open('object-attribute');
		AttributeListInterface.target = this.target;
		const isNew = item.key === '';
		if (isNew) {
			item.key = Attribute.getDefAttributeId(this.group);
			switch (Attribute.getGroupAttribute(this.group, item.key)?.type) {
				case 'boolean':
					item.value = false;
					break;
				case 'number':
					item.value = 0;
					break;
				case 'string':
					item.value = '';
					break;
				case 'enum':
					item.value = '';
					break;
			}
		}
		const key = item.key;
		const type = Attribute.getGroupAttribute(this.group, key)?.type ?? typeof item.value;
		const booleanValue = type === 'boolean' ? item.value : false;
		const numberValue = type === 'number' ? item.value : 0;
		const stringValue = type === 'string' ? item.value : '';
		const enumValue = type === 'enum' ? item.value : '';
		const keyBox = $('#object-attribute-key');
		keyBox.loadItems(Attribute.getAttributeItems(this.group, 'boolean number string'));
		const invalid = !Attribute.getGroupAttribute(this.group, key);
		if (invalid) AttributeListInterface.typeBox.write(type);
		const write = getElementWriter('object-attribute');
		write('key', key);
		write('boolean-value', booleanValue);
		write('number-value', numberValue);
		write('string-value', stringValue);
		if (enumValue) {
			write('enum-value', enumValue);
		}
		if (isNew || invalid) {
			return $('#object-attribute-key').getFocus();
		}
		switch (type) {
			case 'boolean':
				return $('#object-attribute-boolean-value').getFocus();
			case 'number':
				return $('#object-attribute-number-value').getFocus('all');
			case 'string':
				return $('#object-attribute-string-value').getFocus('all');
			case 'enum':
				return $('#object-attribute-enum-value').getFocus();
		}
	}

	save() {
		const read = getElementReader('object-attribute');
		const type = AttributeListInterface.typeBox.read();
		const key = read('key');
		if (key === '') {
			return $('#object-attribute-key').getFocus();
		}
		let value;
		switch (type) {
			case 'boolean':
				value = read('boolean-value');
				break;
			case 'number':
				value = read('number-value');
				break;
			case 'string':
				value = read('string-value');
				break;
			case 'enum':
				value = read('enum-value');
				if (value === '') {
					return $('#object-attribute-enum-value').getFocus();
				}
				break;
		}
		Window.close('object-attribute');
		return { key, value };
	}

	static target = null;

	static initialize() {
		this.typeBox.loadItems([
			{ name: 'Boolean', value: 'boolean' },
			{ name: 'Number', value: 'number' },
			{ name: 'String', value: 'string' },
			{ name: 'Enum', value: 'enum' }
		]);

		this.typeBox.enableHiddenMode().relate([
			{
				case: 'boolean',
				targets: [$('#object-attribute-boolean-value')]
			},
			{ case: 'number', targets: [$('#object-attribute-number-value')] },
			{ case: 'string', targets: [$('#object-attribute-string-value')] },
			{ case: 'enum', targets: [$('#object-attribute-enum-value')] }
		]);

		$('#object-attribute-boolean-value').loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);

		$('#object-attribute-key').on('write', this.keyWrite);
		$('#object-attribute-confirm').on('click', () => {
			AttributeListInterface.target.save();
		});
	}

	static keyWrite(event: any) {
		const group = AttributeListInterface.target.getAttribute('group');
		const attr = Attribute.getGroupAttribute(group, event.value);
		if (attr) {
			AttributeListInterface.typeBox.write(attr.type);
			if (attr.type === 'enum') {
				const enumBox = $('#object-attribute-enum-value');
				enumBox.loadItems(Enum.getStringItems(attr.enum));
				enumBox.write(Enum.getDefStringId(attr.enum));
			}
		}
	}

	static _typeBox: SelectBox | null = null;

	static get typeBox() {
		if (!this._typeBox) this._typeBox = new SelectBox();
		return this._typeBox;
	}
}
