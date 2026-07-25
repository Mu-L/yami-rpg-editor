import { getVariable, reportError } from '../util/safe.ts';
import { Attribute } from '../attribute/attribute-window.ts';
import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';
import { Data } from '../data/data-object.ts';
import { Enum } from '../enum/enum-window.ts';
import { FileItem } from '../file/file-item.ts';
import { File } from '../file/file-system-core.ts';
import { GameLocal } from '../local/local-object.ts';
import { Local } from '../tools/localization.ts';

Command.parseBlend = function (blend: string): string {
	return Local.get('blend.' + blend);
};

Command.fetchVariables = function (commands: any[] & { eventId?: string }): void {
	const eventId = commands.eventId;
	const calledEvents: any[] = [eventId];
	let eventIndex = 0;
	this.returnType = Data.events[eventId]?.returnType ?? 'none';
	this.saveVars = true;
	const fetchParameters = (guid: string): void => {
		const globalEvent = Data.events[guid];
		if (!globalEvent) return;
		for (const { type, key } of globalEvent.parameters) {
			let varType: string;
			switch (type) {
				case 'boolean':
					varType = 'boolean';
					break;
				case 'number':
					varType = 'number';
					break;
				case 'string':
					varType = 'string';
					break;
				default:
					varType = 'object';
					break;
			}
			Command.variables.push({
				name: key,
				type: varType,
				comment: this.eventName || '⭐️' + Local.get(`eventParameterTypes.${type}`),
				evIndex: eventIndex,
				isLeftValue: true,
				refCount: 0
			});
		}
	};
	const fetchVariables = (commands: any[]): void => {
		for (const command of commands) {
			const { id, params } = command;
			if (id == null || id[0] === '!') continue;
			Command.currentCommand = command;
			if (id === 'callEvent') {
				if (params?.type === 'global' && calledEvents.append(params.eventId)) {
					const file = Data.manifest.guidMap[params.eventId]?.file;
					if (file instanceof FileItem && !file.data.namespace) {
						let lastEventName = this.eventName;
						let lasteventIndex = this.eventIndex;
						this.eventName = file.basename;
						this.eventIndex = ++eventIndex;
						fetchParameters(params.eventId);
						fetchVariables(file.data.commands);
						this.eventName = lastEventName;
						this.eventIndex = lasteventIndex;
					}
				}
			}
			const handler = this.cases[id];
			let contents;
			try {
				contents = handler
					? handler.parse(params ?? {})
					: this.custom.parse(id, params ?? {});
			} catch (err) {
				reportError(err, `Command.fetchVariables (id=${id})`);
				contents = [];
			}
			for (const content of contents) {
				if (content.children) {
					fetchVariables(content.children);
				}
			}
		}
		Command.currentCommand = null;
	};
	fetchParameters(eventId);
	fetchVariables(commands);
	const { variables } = this;
	this.eventIndex = 0;
	this.eventName = '';
	this.saveVars = false;
	this.variables = [];
	return variables;
};

Command.parseVariable = function (
	variable: any,
	valueType: string = '',
	isLeftValue: boolean = false
): string {
	const key = variable.key;
	switch (variable.type) {
		case 'local': {
			if (Command.saveVars) {
				if (key !== '') {
					Command.variables.push({
						name: key,
						type: valueType,
						comment: Command.eventName,
						evIndex: Command.eventIndex,
						isLeftValue: isLeftValue,
						refCount: 0,
						command: Command.currentCommand
					});
				}
			}
			let varName = Command.setVariableColor(key || Local.get('common.none'));
			if (valueType) {
				const textId = Command.setTextId(`local-${valueType}-${key}`);
				varName = textId + varName;
			}
			return varName;
		}
		case 'global': {
			let varName = Command.parseGlobalVariable(key);
			if (valueType) {
				const gVar = getVariable(variable.key);
				const type = gVar ? typeof gVar.value : valueType;
				const textId = Command.setTextId(`global-${type}-${variable.key}`);
				varName = textId + Command.setGlobalVariableColor(varName);
			}
			return varName;
		}
		case 'self': {
			let varName = Command.setVariableColor(Local.get('variable.self'));
			if (valueType) {
				const textId = Command.setTextId(`self-${valueType}-unnamed`);
				varName = textId + varName;
			}
			return varName;
		}
		case 'actor': {
			const actor = Command.parseActor(variable.actor);
			const attrName = Command.parseVariableAttr('actor', key);
			return typeof key === 'string'
				? actor + Token('.') + attrName
				: actor + Token('[') + attrName + Token(']');
		}
		case 'skill': {
			const skill = Command.parseSkill(variable.skill);
			const attrName = Command.parseVariableAttr('skill', key);
			return typeof key === 'string'
				? skill + Token('.') + attrName
				: skill + Token('[') + attrName + Token(']');
		}
		case 'state': {
			const state = Command.parseState(variable.state);
			const attrName = Command.parseVariableAttr('state', key);
			return typeof key === 'string'
				? state + Token('.') + attrName
				: state + Token('[') + attrName + Token(']');
		}
		case 'equipment': {
			const equipment = Command.parseEquipment(variable.equipment);
			const attrName = Command.parseVariableAttr('equipment', key);
			return typeof key === 'string'
				? equipment + Token('.') + attrName
				: equipment + Token('[') + attrName + Token(']');
		}
		case 'item': {
			const item = Command.parseItem(variable.item);
			const attrName = Command.parseVariableAttr('item', key);
			return typeof key === 'string'
				? item + Token('.') + attrName
				: item + Token('[') + attrName + Token(']');
		}
		case 'element': {
			const element = Command.parseElement(variable.element);
			const attrName = Command.parseVariableAttr('element', key);
			return typeof key === 'string'
				? element + Token('.') + attrName
				: element + Token('[') + attrName + Token(']');
		}
	}
};

Command.parseGlobalVariable = function (id: string): string {
	if (id === '') return Token('none');
	const variable = getVariable(id);
	return variable ? variable.name : Command.parseUnlinkedId(id);
};

Command.parseAttributeGroup = function (groupKey: string): string {
	if (groupKey === '') return Token('none');
	const group = Attribute.getGroup(groupKey);
	if (group) return GameLocal.replace(group.groupName);
	this.invalid = true;
	return Command.parseUnlinkedId(groupKey);
};

Command.parseAttributeKey = (function () {
	const i = / +/g;
	return function (groupKey: string, attrId: string, valueType?: string): string {
		const attr = groupKey
			? Attribute.getGroupAttribute(groupKey, attrId)
			: Attribute.getAttribute(attrId);
		if (attr) {
			const type = valueType ?? (attr.type === 'enum' ? 'string' : attr.type);
			const textId = Command.setTextId(`attribute-${type}-${attr.key ?? attrId}-${attrId}`);
			return textId + Command.setVariableColor(GameLocal.replace(attr.name.replace(i, '')));
		}
		this.invalid = true;
		const textId = Command.setTextId(`attribute-${valueType ?? 'any'}-${attrId}-${attrId}`);
		return textId + Command.setVariableColor(Command.parseUnlinkedId(attrId));
	};
})();

Command.parseAttributeTag = function (id: string, valueType?: string): string {
	return Token('<') + Command.parseAttributeKey('', id, valueType) + Token('>');
};

Command.parseVariableTag = (function IIFE() {
	const local = /(?<=<)local:([\s\S]+?)(?=>)/g;
	const global = /(?<=<)global(::?)([0-9a-f]{16})(?=>)/g;
	const localVar = { type: 'local', key: '' };
	const globalVar = { type: 'global', key: '' };
	const localReplacer = (match: string, varKey: string): string => {
		localVar.key = varKey;
		return Command.parseVariable!(localVar, 'any');
	};
	const globalReplacer = (match: string, delimiter: string, varKey: string): string => {
		globalVar.key = varKey;
		const varSign = delimiter === '::' ? '@' : '';
		return varSign + Command.parseVariable!(globalVar, 'any');
	};
	return (string: string): string =>
		string.replace(local, localReplacer).replace(global, globalReplacer);
})();

Command.parseVariableNumber = function (number: any, unit?: string): string {
	switch (typeof number) {
		case 'number': {
			const text = Command.setNumberColor(number);
			return unit ? text + unit : text;
		}
		case 'object': {
			const text = Command.parseVariable(number, 'number');
			return unit ? text + ' ' + unit : text;
		}
	}
};

Command.parseVariableString = function (string: any): string {
	switch (typeof string) {
		case 'string':
			return Command.setStringColor(`"${Command.parseMultiLineString(string)}"`);
		case 'object':
			return Command.parseVariable(string, 'string');
	}
};

Command.parseVariableTemplate = function (content: any, maxLength: number = 0): string {
	switch (typeof content) {
		case 'string': {
			const tag = Command.parseVariableTag(GameLocal.replace(content));
			let string = Command.parseMultiLineString(tag);
			if (maxLength !== 0 && string.length > maxLength) {
				string = string.slice(0, maxLength) + '...';
			}
			return Command.setStringColor(`"${string}"`, true);
		}
		case 'object':
			return Command.parseVariable(content, 'any');
	}
};

Command.parseVariableAttr = function (groupKey: string, attrId: any): string {
	switch (typeof attrId) {
		case 'string':
			return Command.parseAttributeKey(groupKey, attrId);
		case 'object':
			return Command.parseVariable(attrId, 'string');
	}
};

Command.parseVariableEnum = function (groupKey: string, enumId: any): string {
	switch (typeof enumId) {
		case 'string':
			return Command.parseGroupEnumString(groupKey, enumId);
		case 'object':
			return Command.parseVariable(enumId, 'string');
	}
};

Command.parseVariableFile = function (fileId: any): string {
	switch (typeof fileId) {
		case 'string':
			return Command.parseFileName(fileId);
		case 'object':
			return Command.parseVariable(fileId, 'string');
	}
};

Command.parseVariableTeam = function (id: any): string {
	switch (typeof id) {
		case 'string':
			return Command.parseTeam(id);
		case 'object':
			return Command.parseVariable(id, 'string');
	}
};

Command.parseMultiLineString = (function IIFE() {
	const regexp = /\n/g;
	return function (string: string): string {
		return string.replace(regexp, '\\n');
	};
})();

Command.parseSpriteName = function (animationId: string, spriteId: string): string {
	if (spriteId === '') return Token('none');
	const animation = Data.animations[animationId];
	const sprite = animation?.sprites.find((a) => a.id === spriteId);
	if (sprite) return sprite.name;
	this.invalid = true;
	return Command.parseUnlinkedId(spriteId);
};

Command.parseEventType = function (groupKey: string, eventType: string): string {
	return (
		Local.get('eventTypes.' + eventType) || Command.parseGroupEnumString(groupKey, eventType)
	);
};

Command.parseEnumGroup = function (groupKey: string): string {
	if (groupKey === '') return Token('none');
	const group = Enum.getGroup(groupKey);
	if (group) return GameLocal.replace(group.groupName);
	this.invalid = true;
	return Command.parseUnlinkedId(groupKey);
};

Command.parseEnumString = function (stringId: string): string {
	if (stringId === '') return Token('none');
	const string = Enum.getString(stringId);
	if (string) {
		const textId = Command.setTextId(`enum-string-${string.value ?? stringId}-${stringId}`);
		return textId + Command.setStringColor(GameLocal.replace(string.name));
	}
	this.invalid = true;
	const textId = Command.setTextId(`enum-string-${stringId}-${stringId}`);
	return textId + Command.setStringColor(Command.parseUnlinkedId(stringId));
};

Command.parseEnumStringTag = function (stringId: string): string {
	return Token('<') + Command.parseEnumString(stringId) + Token('>');
};

Command.parseGroupEnumString = function (groupKey: string, stringId: string): string {
	if (stringId === '') return Token('none');
	const string = Enum.getGroupString(groupKey, stringId);
	const textId = Command.setTextId(`enum-string-${stringId}-${stringId}`);
	if (string) return textId + Command.setStringColor(GameLocal.replace(string.name));
	this.invalid = true;
	return textId + Command.setStringColor(Command.parseUnlinkedId(stringId));
};

Command.parseListItem = function (variable: any, index: any): string {
	const listName = Command.parseVariable(variable, 'object');
	const listIndex = Command.parseVariableNumber(index);
	return listName + Token('[') + listIndex + Token(']');
};

Command.parseParameter = function (key: any): string {
	const label = Local.get('parameter.param');
	const paramKey = Command.parseVariableString(key);
	return label + Token('(') + paramKey + Token(')');
};

Command.parseActor = function (actor: any): string {
	switch (actor.type) {
		case 'trigger':
			return Command.setTextId('actor-object-trigger') + Local.get('actor.trigger');
		case 'caster':
			return Command.setTextId('actor-object-caster') + Local.get('actor.caster');
		case 'latest':
			return Command.setTextId('actor-object-latest') + Local.get('actor.latest');
		case 'target':
			return Command.setTextId('actor-object-target') + Local.get('actor.target');
		case 'player':
			return Command.setTextId('actor-object-player') + Local.get('actor.player');
		case 'member':
			return (
				Command.setTextId('actor-object-member') +
				Local.get('actor.member') +
				Token('[') +
				Command.parseVariableNumber(actor.memberId) +
				Token(']')
			);
		case 'global':
			return (
				Command.setTextId(`actor-object-${actor.actorId}`) +
				Command.parseFileName(actor.actorId)
			);
		case 'by-id':
			return Command.parsePresetObject(actor.presetId);
		case 'variable': {
			const label = Local.get('actor.common');
			const textId = Command.setTextId('actor-object-variable');
			const variable = Command.parseVariable(actor.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parseSkill = function (skill: any): string {
	switch (skill.type) {
		case 'trigger':
			return Command.setTextId('skill-object-trigger') + Local.get('skill.trigger');
		case 'latest':
			return Command.setTextId('skill-object-latest') + Local.get('skill.latest');
		case 'by-key': {
			const actor = Command.parseActor(skill.actor);
			const label = Local.get('skill.common');
			const textId = Command.setTextId('skill-object-by-key');
			const key = Command.parseVariableEnum('shortcut-key', skill.key);
			return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>');
		}
		case 'by-id': {
			const actor = Command.parseActor(skill.actor);
			const file = Command.parseFileName(skill.skillId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = Local.get('skill.common');
			const textId = Command.setTextId('skill-object-variable');
			const variable = Command.parseVariable(skill.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parseState = function (state: any): string {
	switch (state.type) {
		case 'trigger':
			return Command.setTextId('state-object-trigger') + Local.get('state.trigger');
		case 'latest':
			return Command.setTextId('state-object-latest') + Local.get('state.latest');
		case 'by-id': {
			const actor = Command.parseActor(state.actor);
			const file = Command.parseFileName(state.stateId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = Local.get('state.common');
			const textId = Command.setTextId('state-object-variable');
			const variable = Command.parseVariable(state.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parseEquipment = function (equipment: any): string {
	switch (equipment.type) {
		case 'trigger':
			return Command.setTextId('equipment-object-trigger') + Local.get('equipment.trigger');
		case 'latest':
			return Command.setTextId('equipment-object-latest') + Local.get('equipment.latest');
		case 'by-slot': {
			const actor = Command.parseActor(equipment.actor);
			const label = Local.get('equipment.common');
			const textId = Command.setTextId('equipment-object-by-slot');
			const slot = Command.parseVariableEnum('equipment-slot', equipment.slot);
			return actor + Token(' -> ') + textId + label + Token('<') + slot + Token('>');
		}
		case 'by-id-equipped':
		case 'by-id-inventory': {
			const actor = Command.parseActor(equipment.actor);
			const file = Command.parseFileName(equipment.equipmentId);
			const source = Command.setWeakColor(Local.get('equipment.' + equipment.type));
			return actor + Token(' -> ') + file + ' ' + Token('(') + source + Token(')');
		}
		case 'variable': {
			const label = Local.get('equipment.common');
			const textId = Command.setTextId('equipment-object-variable');
			const variable = Command.parseVariable(equipment.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parseItem = function (item: any): string {
	switch (item.type) {
		case 'trigger':
			return Command.setTextId('item-object-trigger') + Local.get('item.trigger');
		case 'latest':
			return Command.setTextId('item-object-latest') + Local.get('item.latest');
		case 'by-key': {
			const actor = Command.parseActor(item.actor);
			const label = Local.get('item.common');
			const textId = Command.setTextId('item-object-by-key');
			const key = Command.parseVariableEnum('shortcut-key', item.key);
			return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>');
		}
		case 'by-id': {
			const actor = Command.parseActor(item.actor);
			const file = Command.parseFileName(item.itemId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = Local.get('item.common');
			const variable = Command.parseVariable(item.variable, 'object');
			const textId = Command.setTextId('item-object-variable');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parsePosition = function (position: any): string {
	switch (position.type) {
		case 'absolute': {
			const x = Command.parseVariableNumber(position.x);
			const y = Command.parseVariableNumber(position.y);
			return Local.get('position.common') + Token('(') + x + Token(', ') + y + Token(')');
		}
		case 'relative': {
			const x = Command.parseVariableNumber(position.x);
			const y = Command.parseVariableNumber(position.y);
			return Local.get('position.relative') + Token('(') + x + Token(', ') + y + Token(')');
		}
		case 'actor':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parseActor(position.actor) +
				Token(')')
			);
		case 'trigger':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parseTrigger(position.trigger) +
				Token(')')
			);
		case 'light':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parseLight(position.light) +
				Token(')')
			);
		case 'region': {
			const region = Command.parseRegion(position.region);
			const mode = Local.get('position.region.mode.' + position.mode);
			return (
				Local.get('position.common') + Token('(') + region + Token(', ') + mode + Token(')')
			);
		}
		case 'object':
			return (
				Local.get('position.common') +
				Token('(') +
				Command.parsePresetObject(position.objectId) +
				Token(')')
			);
		case 'mouse':
			return (
				Local.get('position.common') + Token('(') + Local.get('position.mouse') + Token(')')
			);
	}
};

Command.parseAngle = function (angle: any): string {
	const type = angle.type;
	const desc = Local.get('angle.' + type);
	switch (type) {
		case 'position':
			return `${desc} ${Command.parsePosition(angle.position)}`;
		case 'absolute':
		case 'relative':
		case 'direction':
			return `${desc} ${Command.parseVariableNumber(angle.degrees, '°')}`;
		case 'random':
			return desc;
	}
};

Command.parseTrigger = function (trigger: any): string {
	switch (trigger.type) {
		case 'trigger':
			return Command.setTextId('trigger-object-trigger') + Local.get('trigger.trigger');
		case 'latest':
			return Command.setTextId('trigger-object-latest') + Local.get('trigger.latest');
		case 'variable': {
			const label = Local.get('trigger.common');
			const textId = Command.setTextId('trigger-object-variable');
			const variable = Command.parseVariable(trigger.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parseLight = function (light: any): string {
	switch (light.type) {
		case 'trigger':
			return Command.setTextId('light-object-trigger') + Local.get('light.trigger');
		case 'latest':
			return Command.setTextId('light-object-latest') + Local.get('light.latest');
		case 'by-id':
			return Command.parsePresetObject(light.presetId);
		case 'variable': {
			const label = Local.get('light.common');
			const textId = Command.setTextId('light-object-variable');
			const variable = Command.parseVariable(light.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parseRegion = function (region: any): string {
	switch (region.type) {
		case 'trigger':
			return Command.setTextId('region-object-trigger') + Local.get('region.trigger');
		case 'by-id':
			return Command.parsePresetObject(region.presetId);
	}
};

Command.parseTilemap = function (tilemap: any): string {
	switch (tilemap.type) {
		case 'trigger':
			return Command.setTextId('tilemap-object-trigger') + Local.get('tilemap.trigger');
		case 'by-id':
			return Command.parsePresetObject(tilemap.presetId);
		case 'variable':
			return Command.parseVariable(tilemap.variable, 'object');
	}
};

Command.parseObject = function (object: any): string {
	switch (object.type) {
		case 'trigger':
			return Command.setTextId('preset-object-trigger') + Local.get('object.trigger');
		case 'latest':
			return Command.setTextId('preset-object-latest') + Local.get('object.latest');
		case 'by-id':
			return Command.parsePresetObject(object.presetId);
		case 'variable': {
			const label = Local.get('object.common');
			const textId = Command.setTextId('preset-object-variable');
			const variable = Command.parseVariable(object.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parseElement = function (element: any): string {
	switch (element.type) {
		case 'trigger':
			return Command.setTextId('element-object-trigger') + Local.get('element.trigger');
		case 'latest':
			return Command.setTextId('element-object-latest') + Local.get('element.latest');
		case 'by-id':
			return Command.parsePresetElement(element.presetId, false);
		case 'by-ancestor-and-id': {
			const ancestor = Command.parseElement(element.ancestor);
			const descendant = Command.parsePresetElement(element.presetId, false);
			return ancestor + Token(' -> ') + descendant;
		}
		case 'by-index': {
			const parent = Command.parseElement(element.parent);
			const label = Local.get('element.common');
			const textId = Command.setTextId('element-object-by-index');
			const index = Command.parseVariableNumber(element.index);
			const child = textId + label + Token('[') + index + Token(']');
			return parent + Token(' -> ') + child;
		}
		case 'by-button-index': {
			const focus = Command.parseElement(element.focus);
			const label = Local.get('element.button');
			const textId = Command.setTextId('element-object-by-button-index');
			const index = Command.parseVariableNumber(element.index);
			const child = textId + label + Token('[') + index + Token(']');
			return focus + Token(' -> ') + child;
		}
		case 'selected-button': {
			const focus = Command.parseElement(element.focus);
			const button = Local.get('element.selected-button');
			const textId = Command.setTextId('element-object-selected-button');
			return focus + Token(' -> ') + textId + button;
		}
		case 'focus':
			return Command.setTextId('element-object-focus') + Local.get('element.focus');
		case 'parent': {
			const label = Local.get('element.parent');
			const textId = Command.setTextId('element-object-parent');
			const parent = Command.parseVariable(element.variable, 'object');
			return textId + label + Token('(') + parent + Token(')');
		}
		case 'variable': {
			const label = Local.get('element.common');
			const textId = Command.setTextId('element-object-variable');
			const variable = Command.parseVariable(element.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
};

Command.parsePresetObject = function (presetId: string): string {
	if (presetId === '') return Token('none');
	const name = Data.scenePresets[presetId]?.data.name;
	const textId = Command.setTextId(`scene-object-${presetId}`);
	return typeof name === 'string'
		? textId + Command.setPresetColor(name)
		: textId + Command.setPresetColor(Command.parseUnlinkedId(presetId));
};

Command.parsePresetElement = function (presetId: string, detailed: boolean = true): string {
	if (presetId === '') return Token('none');
	const uiId = Data.uiPresets[presetId]?.uiId ?? '';
	const preset = Data.uiPresets[presetId]?.data;
	const textId = Command.setTextId(`ui-object-${presetId}`);
	let presetName = preset?.name;
	if (presetName === undefined) {
		this.invalid = true;
		presetName = Command.setPresetColor(Command.parseUnlinkedId(presetId));
	} else if (presetName) {
		presetName = Command.setPresetColor(presetName);
	}
	switch (detailed) {
		case true: {
			const uiName = Command.parseFileName(uiId);
			return uiName + ' ' + Token('{') + textId + presetName + Token('}');
		}
		case false:
			return textId + presetName;
	}
};

Command.parseTeam = function (id: string): string {
	const team = Data.teams.map[id];
	if (team) return team.name;
	this.invalid = true;
	return Command.parseUnlinkedId(id);
};

Command.parseHexColor = function (hex: string): string {
	return Command.setStringColor('#' + hex);
};

Command.parseActorSelector = function (selector: string): string {
	switch (selector) {
		case 'enemy':
		case 'friend':
		case 'team':
		case 'team-except-self':
		case 'any-except-self':
		case 'any':
			return Local.get('actorFilter.' + selector);
	}
};

Command.parseFileName = function (id: string): string {
	if (id === '') return Token('none');
	const meta = Data.manifest.guidMap[id];
	const textId = Command.setTextId(`file-string-${id}`);
	if (meta) return textId + Command.setFileColor((File as any).parseMetaName(meta));
	this.invalid = true;
	return textId + Command.setFileColor(Command.parseUnlinkedId(id));
};

Command.parseAudioType = function (type: string): string {
	switch (type) {
		case 'bgm':
			return 'BGM';
		case 'bgs':
			return 'BGS';
		case 'cv':
			return 'CV';
		case 'se':
		case 'se-attenuated':
			return 'SE';
		case 'all':
			return 'ALL';
	}
};

Command.parseWait = function (wait: boolean): string {
	switch (wait) {
		case false:
			return '';
		case true:
			return Local.get('transition.wait');
	}
};

Command.parseEasing = function (easingId: string, duration: number, wait: boolean): string {
	if (duration === 0) return '';
	const easing = Data.easings.map[easingId];
	const time = Command.parseVariableNumber(duration, 'ms');
	const info = (easing?.name ?? `#${easingId}`) + Token(', ') + time;
	return wait ? info + Token(', ') + Local.get('transition.wait') : info;
};

Command.parseUnlinkedId = function (name: string): string {
	return name ? `#${name}` : '';
};

Command.parseTextTags = (function IIFE() {
	const regexp = /\$_(\S+?)_\$([\s\S]*?)\$_\/_\$/g;
	return function (contents: any[]): any[] {
		let i = contents.length;
		while (--i >= 0) {
			const content = contents[i];
			if (content.text !== undefined) {
				const text = content.text;
				const inserts = [];
				let end = 0;
				let match;
				while ((match = regexp.exec(text))) {
					const start = match.index;
					if (end < start) {
						inserts.push({ text: text.slice(end, start) });
					}
					if (match[1] === 'textId') {
						inserts.push({ textId: match[2] });
					} else if (match[1] === 'tooltip') {
						inserts.push({ tooltip: match[2] });
					} else if (match[1] === 'class') {
						inserts.push({ class: match[2] });
					} else if (match[2] === '$_none_$') {
						inserts.push({ color: match[1] });
					} else {
						inserts.push({ color: match[1] }, { text: match[2] }, { color: 'restore' });
					}
					end = start + match[0].length;
				}
				if (inserts.length !== 0) {
					if (end < text.length) {
						inserts.push({ text: text.slice(end) });
					}
					contents.splice(i, 1, ...inserts);
				}
			}
		}
		return contents;
	};
})();

Command.removeTextTags = (function IIFE() {
	const regexp = /\$_textId_\$(?:\S+?)_\/_\$|\$_(?:\S+?)_\$/g;
	return function (string: string): string {
		return string.replace(regexp, '');
	};
})();
