import { $ } from '@/util/dom.ts';
import { reportError } from '@/util/safe.ts';
import { ActorGetter } from '@/command/actor-accessor-window.ts';
import { AncestorGetter } from '@/command/ancestor-accessor-window.ts';
import { AngleGetter } from '@/command/angle-accessor-window.ts';
import { Command } from '@/command/command-object.ts';
import { CommandSuggestion } from '@/command/command-tip.ts';
import { ElementGetter } from '@/command/element-accessor-window.ts';
import { EquipmentGetter } from '@/command/equipment-accessor-window.ts';
import { ItemGetter } from '@/command/item-accessor-window.ts';
import { LightGetter } from '@/command/preset-accessor-factory.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { PositionGetter } from '@/command/position-accessor-window.ts';
import { RegionGetter } from '@/command/region-accessor-window.ts';
import { ObjectGetter } from '@/command/preset-accessor-factory.ts';
import { SkillGetter } from '@/command/skill-accessor-window.ts';
import { StateGetter } from '@/command/state-accessor-window.ts';
import { TextSuggestion } from '@/command/text-tip.ts';
import { TilemapGetter } from '@/command/tilemap-accessor-window.ts';
import { TriggerGetter } from '@/command/trigger-accessor-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Data } from '@/data/data-object.ts';
import { Local } from '@/tools/localization.ts';
import { Window } from '@/tools/window-object.ts';

export class CommandSchema {
	name: string;
	fields: any[];
	children: boolean;
	confirmId: string;
	onParse;
	onLoad;
	onSave;
	onInitialize;
	customParse;
	customLoad;
	customSave;
	noWindow;

	constructor(config: any) {
		this.name = config.name;
		this.fields = config.fields ?? [];
		this.children = config.children ?? false;
		this.confirmId = config.confirmId ?? `${config.name}-confirm`;
		this.onParse = config.onParse;
		this.onLoad = config.onLoad;
		this.onSave = config.onSave;
		this.onInitialize = config.initialize ?? config.onInitialize;
		this.customParse = config.parse ?? config.customParse;
		this.customLoad = config.load ?? config.customLoad;
		this.customSave = config.save ?? config.customSave;
		this.noWindow = config.noWindow ?? false;
		const reserved = new Set([
			'name',
			'fields',
			'children',
			'confirmId',
			'onParse',
			'onLoad',
			'onSave',
			'initialize',
			'onInitialize',
			'parse',
			'customParse',
			'load',
			'customLoad',
			'save',
			'customSave',
			'noWindow'
		]);
		for (const key of Object.keys(config)) {
			if (reserved.has(key) || key in this) {
				continue;
			}
			this[key] = config[key];
		}
		if (this.noWindow) {
			this.load = null;
			this.initialize = null;
		}
	}

	// 取字段默认值（支持函数延迟求值）
	_getDefault(field: any) {
		return typeof field.default === 'function' ? field.default() : field.default;
	}

	createDefault() {
		const data = {};
		for (const field of this.fields) {
			const value = this._getDefault(field);
			if (value !== undefined) {
				data[field.key] = value;
			}
		}
		return data;
	}

	initialize() {
		if (this.onInitialize) {
			return this.onInitialize();
		}
		$(`#${this.confirmId}`).on('click', () => this.save());
	}

	parse(data: any) {
		if (this.customParse) {
			return this.customParse(data);
		}
		const alias = Local.get(`command.${this.name}.alias`);
		const contents = [
			{ fold: true },
			{ color: 'flow' },
			{ text: (alias ?? this.name) + Token(': ') },
			{ color: 'gray' },
			{ color: 'save' }
		];
		if (this.onParse) {
			this.onParse(data, contents);
		}
		return contents;
	}

	load(data: any) {
		if (this.customLoad) {
			return this.customLoad(data);
		}
		for (const field of this.fields) {
			const value = data[field.key] ?? this._getDefault(field);
			$(`#${this.name}-${field.domId ?? field.key}`).write(value);
		}
		if (this.onLoad) {
			this.onLoad(data);
		}
	}

	save() {
		if (this.customSave) {
			return this.customSave();
		}
		const data = {};
		let focusTarget = null;
		for (const field of this.fields) {
			const value = $(`#${this.name}-${field.domId ?? field.key}`).read();
			if (field.required && (value === '' || value === undefined)) {
				focusTarget = $(`#${this.name}-${field.domId ?? field.key}`);
				break;
			}
			data[field.key] = value;
		}
		if (focusTarget) {
			return focusTarget.getFocus();
		}
		if (this.onSave) {
			this.onSave(data);
		}
		Command.save(data);
	}

	// --- 静态分发方法 ---

	static _resolve(id: any) {
		return Command.cases[id];
	}

	static _topoSort(names: any, getDeps: any) {
		const graph: Map<string, string[]> = new Map(names.map((n) => [n, []]));
		const inDegree: Map<string, number> = new Map(names.map((n) => [n, 0]));
		for (const name of names) {
			for (const dep of getDeps(name) ?? []) {
				if (!graph.has(dep)) continue;
				graph.get(dep).push(name);
				inDegree.set(name, inDegree.get(name) + 1);
			}
		}
		const queue = names.filter((n) => inDegree.get(n) === 0);
		const result = [];
		while (queue.length) {
			const node = queue.shift();
			result.push(node);
			for (const next of graph.get(node)) {
				inDegree.set(next, inDegree.get(next) - 1);
				if (inDegree.get(next) === 0) queue.push(next);
			}
		}
		return result;
	}

	static initAll() {
		Command.words = new Command.WordList();
		const subMap = {
			CommandSuggestion,
			TextSuggestion,
			VariableGetter,
			ActorGetter,
			SkillGetter,
			StateGetter,
			EquipmentGetter,
			ItemGetter,
			PositionGetter,
			AngleGetter,
			TriggerGetter,
			LightGetter,
			RegionGetter,
			TilemapGetter,
			ObjectGetter,
			ElementGetter,
			AncestorGetter
		};
		const sorted = CommandSchema._topoSort(
			Object.keys(subMap),
			(name) => subMap[name].dependsOn
		);
		for (const name of sorted) {
			subMap[name].initialize();
		}
		Command.custom.initialize();
		for (const object of Object.values<any>(Command.cases)) {
			object.initialize?.();
		}
	}

	static insert(target: any, id: any) {
		Command.target = target;
		if (id) {
			target.scrollAndResize();
			return CommandSchema.open(id);
		}
		CommandSuggestion.open();
	}

	static open(id: any) {
		const handler = CommandSchema._resolve(id);
		if (handler !== undefined) {
			Command.id = id;
			if (handler.load) {
				const point = Command.target.getSelectionPosition();
				if (point) {
					Window.setPositionMode('absolute');
					Window.absolutePos.x = point.x + 100;
					Window.absolutePos.y = point.y;
					Window.open(id);
					Window.setPositionMode('overlap');
					handler.load({});
				}
			} else {
				handler.save();
			}
			return;
		}
		const meta = Data.scripts[id];
		if (meta !== undefined && Command.custom.commandNameMap?.[id]) {
			Command.id = id;
			if (meta.parameters.length !== 0) {
				const point = Command.target.getSelectionPosition();
				if (point) {
					Window.setPositionMode('absolute');
					Window.absolutePos.x = point.x + 100;
					Window.absolutePos.y = point.y;
					Window.open('scriptCommand');
					Window.setPositionMode('overlap');
					Command.custom.load(id, {});
				}
			} else {
				Command.custom.save();
			}
		}
	}

	static edit(target: any, command: any) {
		const { id, params } = command;
		const handler = CommandSchema._resolve(id);
		if (handler?.load instanceof Function) {
			Command.target = target;
			Command.id = id;
			target.scrollAndResize();
			const point = target.getSelectionPosition();
			if (point) {
				Window.setPositionMode('absolute');
				Window.absolutePos.x = point.x + 100;
				Window.absolutePos.y = point.y;
				Window.open(id);
				Window.setPositionMode('overlap');
				handler.load(params);
			}
		}
		if (handler) return;
		const meta = Data.scripts[id];
		if (meta?.parameters.length > 0 && Command.custom.commandNameMap?.[id]) {
			Command.target = target;
			Command.id = id;
			target.scrollAndResize();
			const point = target.getSelectionPosition();
			if (point) {
				Window.setPositionMode('absolute');
				Window.absolutePos.x = point.x + 100;
				Window.absolutePos.y = point.y;
				Window.open('scriptCommand');
				Window.setPositionMode('overlap');
				Command.custom.load(id, params);
			}
		}
	}

	static save(params: any) {
		const { id, target } = Command;
		target.save({ id, params });
		const handler = CommandSchema._resolve(id);
		if (handler !== undefined) {
			handler.load && Window.close(id);
		} else {
			Window.close('scriptCommand');
		}
	}

	static parse(command: any, varMap: any) {
		Command.varMap = varMap;
		let id = command?.id;
		if (id == null) {
			Command.invalid = true;
			reportError(new Error('指令缺少 id'), 'CommandSchema.parse');
			return '';
		}
		if (id[0] === '!') {
			id = id.slice(1);
		}
		Command.invalid = false;
		const params = command.params ?? {};
		const handler = CommandSchema._resolve(id);
		try {
			const contents = handler ? handler.parse(params) : Command.custom.parse(id, params);
			return Command.parseTextTags(contents);
		} catch (err) {
			Command.invalid = true;
			reportError(err, `CommandSchema.parse (id=${id})`);
			return `[解析失败: ${id}]`;
		}
	}
}
