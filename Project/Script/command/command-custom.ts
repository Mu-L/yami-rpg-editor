import { $ } from '../util/dom.ts';
import { Command } from './command-object.ts';
import { Window } from '../tools/window-object.ts';
import { CommandSuggestion } from './command-tip.ts';
import { Token } from './mark-string-manager.ts';
import { TreeList } from '../components/tree-list.ts';
import { Data } from '../data/data-object.ts';
import { Layout } from '../layout/layout.ts';
import { PluginManager } from '../plugin/plugin.ts';
import { Local } from '../tools/localization.ts';

// ******************************** 自定义指令 ********************************

Command.custom = {
	customFolder: null,
	commandNameMap: null,
	windowX: null,
	windowY: null,
	parsingScript: { id: '', parameters: null },
	loadedScript: { id: '', parameters: null },
	windowFrame: $('#scriptCommand'),
	parameterPane: $('#scriptCommand-parameter-pane'),
	parameterGrid: $('#scriptCommand-parameter-grid'),

	// 初始化
	initialize: function () {
		window.on('localize', this.windowLocalize);
		$('#scriptCommand-confirm').on('click', this.save);

		// 参数面板 - 设置获取数据方法
		const scriptList = [this.loadedScript];
		this.parameterPane.getData = () => scriptList;

		// 参数面板 - 调整大小时回调
		this.parameterPane.onResize = () => {
			const height = grid.clientHeight;
			this.windowFrame.style.height = `${height + 78}px`;
			// 如果窗口被拖动过会重置位置，不过影响不大
			this.windowFrame.absolute(this.windowX, this.windowY);
		};

		// 参数面板 - 重新创建细节框方法
		const box = $('#scriptCommand-parameter-detail');
		const grid = this.parameterGrid;
		const wrap = { box, grid, children: [] };
		box.wrap = wrap;
		this.parameterPane.createDetailBox = function () {
			return wrap;
		};

		// 参数面板 - 重写清除内容方法
		this.parameterPane.clear = function () {
			this.metas = [];
			const { wraps } = this;
			if (wraps.length !== 0) {
				const { children, box } = wraps[0];
				let i = children.length;
				while (--i >= 0) {
					this.recycle(children[i]);
				}
				box.meta = null;
				box.data = null;
				children.length = 0;
				wraps.length = 0;
			}
			window.off('script-change', this.scriptChange);
		};

		// 窗口 - 已关闭事件
		this.windowFrame.on('closed', (event) => {
			this.loadedScript.parameters = null;
			this.parameterPane.clear();
		});
	},

	// 解析自定义指令
	parse: function (id, parameters) {
		// 如果不存在脚本，则返回ID名称
		const meta = Data.scripts[id];
		const name = this.commandNameMap[id];
		if (meta === undefined || name === undefined) {
			const label = Local.get('command.invalidCommand');
			const cmdId = Command.parseUnlinkedId(id);
			return [{ color: 'invalid' }, { text: `${label}: ${cmdId}` }];
		}
		// 重构脚本参数
		const script = this.parsingScript;
		script.id = id;
		script.parameters = parameters;
		PluginManager.reconstruct(script);
		// 获取重构后的参数
		parameters = script.parameters;
		script.parameters = null;
		// 如果不带参数，直接返回指令名称
		const mParameters = meta.parameters;
		if (mParameters.length === 0) {
			return [{ color: 'custom' }, { text: name }];
		}
		// 获取指令参数
		const words = Command.words;
		const states = meta.manager.states;
		for (const parameter of mParameters) {
			const { type, key } = parameter;
			const value = parameters[key];
			if (states[key] === false) {
				continue;
			}
			switch (type) {
				case 'boolean':
					words.push(Command.setBooleanColor(value));
					continue;
				case 'number':
					words.push(Command.setNumberColor(value));
					continue;
				case 'variable-number':
					words.push(Command.parseVariableNumber(value));
					continue;
				case 'string':
					words.push(Command.setStringColor(`"${value}"`));
					continue;
				case 'option': {
					const index = parameter.options.indexOf(value);
					if (index !== -1) {
						const { name } = parameter.dataItems[index];
						words.push(meta.langMap.update().get(name));
					}
					continue;
				}
				case 'easing':
					words.push(Data.easings.map[value].name);
					continue;
				case 'team':
					words.push(Data.teams.map[value].name);
					continue;
				case 'variable':
					words.push(
						value
							? Command.parseVariable(
									{ type: 'global', key: value },
									'any'
								)
							: Token('none')
					);
					continue;
				case 'attribute':
					words.push(Command.parseAttributeKey('', value, 'object'));
					continue;
				case 'attribute-key':
					words.push(Command.parseAttributeKey('', value, 'string'));
					continue;
				case 'attribute-group':
					words.push(Command.parseAttributeGroup(value));
					continue;
				case 'enum':
				case 'enum-value':
					words.push(Command.parseEnumString(value));
					continue;
				case 'enum-group':
					words.push(Command.parseEnumGroup(value));
					continue;
				case 'file':
				case 'image':
				case 'audio':
					words.push(Command.parseFileName(value));
					continue;
				case 'variable-getter':
				case 'variable-setter':
					words.push(Command.parseVariable(value, 'any'));
					continue;
				case 'actor-getter':
					words.push(Command.parseActor(value));
					continue;
				case 'skill-getter':
					words.push(Command.parseSkill(value));
					continue;
				case 'state-getter':
					words.push(Command.parseState(value));
					continue;
				case 'equipment-getter':
					words.push(Command.parseEquipment(value));
					continue;
				case 'item-getter':
					words.push(Command.parseItem(value));
					continue;
				case 'element-getter':
					words.push(Command.parseElement(value));
					continue;
				case 'position-getter':
					words.push(Command.parsePosition(value));
					continue;
				case 'number[]': {
					const numbers = value.slice(0, 5);
					for (let i = 0; i < numbers.length; i++) {
						numbers[i] = Command.setNumberColor(numbers[i]);
					}
					if (value.length > 5) {
						numbers.push(Token('...'));
					}
					words.push(
						Token('[') + numbers.join(Token(', ')) + Token(']')
					);
					continue;
				}
				case 'string[]': {
					const strings = value.slice(0, 5);
					for (let i = 0; i < strings.length; i++) {
						strings[i] = Command.setStringColor(
							`"${Command.parseMultiLineString(strings[i])}"`
						);
					}
					if (value.length > 5) {
						numbers.push(Token('...'));
					}
					words.push(
						Token('[') + strings.join(Token(', ')) + Token(']')
					);
					continue;
				}
				case 'keycode':
					words.push(
						value ? Command.setStringColor(value) : Token('null')
					);
					continue;
				case 'color':
					words.push(Command.parseHexColor(value));
					continue;
			}
		}
		return [
			{ color: 'custom' },
			{ text: name + Token(': ') },
			{ text: words.join() }
		];
	},

	// 加载自定义指令
	load: function (id, parameters) {
		this.loadedScript.id = id;
		this.loadedScript.parameters = Object.clone(parameters);
		this.windowX = Window.absolutePos.x;
		this.windowY = Window.absolutePos.y;
		this.parameterPane.update();
		const selector = Layout.focusableSelector;
		this.parameterPane.querySelector(selector)?.getFocus();
		this.windowFrame.setTitle(this.commandNameMap[id]);
	},

	// 保存参数
	save: function () {
		Command.save(Command.custom.loadedScript.parameters ?? {});
	},

	// 加载指令列表
	loadCommandList: async function () {
		if (!Data.commands) return;
		const { list } = CommandSuggestion;
		if (!this.customFolder) {
			if (list.data instanceof Promise) {
				await list.data;
			}
			list.data.push(
				(this.customFolder = {
					class: 'folder',
					value: 'custom',
					expanded: true,
					children: null
				})
			);
		}
		const commands = [];
		const commandNameMap = {};
		for (const command of Data.commands) {
			const id = command.id;
			let meta = Data.scripts[id];
			if (meta instanceof Promise) {
				meta = await meta;
			}
			if (!meta || id in commandNameMap) {
				continue;
			}
			const map = meta.langMap.update();
			const name =
				command.alias ||
				map.get(meta.overview.plugin) ||
				Command.parseFileName(id);
			commandNameMap[id] = name;
			commands.push({
				class: 'custom',
				value: id,
				name: name,
				desc: map.get(meta.overview.desc),
				keywords: command.keywords,
				unspacedName: String.compress(name)
			});
		}
		this.customFolder.children = commands;
		this.commandNameMap = commandNameMap;
		CommandSuggestion.windowLocalize();
		TreeList.createParents(commands, this.customFolder);
	},

	// 窗口 - 本地化事件
	windowLocalize: function (event) {
		if (Command.custom.commandNameMap) {
			Command.custom.loadCommandList();
		}
	}
};
