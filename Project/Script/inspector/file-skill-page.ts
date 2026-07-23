import { $, getElementWriter } from '../util/dom.ts';
import { Browser } from '../browser/project-browser.ts';
import { File } from '../file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { EventListInterface } from '../tools/event-list.ts';
import { AttributeListInterface } from '../tools/property-list.ts';
import { ScriptListInterface } from '../tools/script-list.ts';

// ******************************** 文件 - 技能页面 ********************************

{
	const FileSkill = {
		// properties
		target: null,
		meta: null,
		// methods
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		// events
		paramInput: null,
		listChange: null
	};

	// 初始化
	FileSkill.initialize = function () {
		// 绑定属性列表
		$('#fileSkill-attributes').bind(new AttributeListInterface());

		// 绑定事件列表
		$('#fileSkill-events').bind(new EventListInterface(this));

		// 绑定脚本列表
		$('#fileSkill-scripts').bind(new ScriptListInterface());

		// 绑定脚本参数面板
		$('#fileSkill-parameter-pane').bind($('#fileSkill-scripts'));

		// 侦听事件
		$('#fileSkill-icon, #fileSkill-clip, #fileSkill-inherit').on('input', this.paramInput);
		$('#fileSkill-attributes, #fileSkill-events, #fileSkill-scripts').on(
			'change',
			this.listChange
		);
	};

	// 创建技能
	FileSkill.create = function () {
		return {
			icon: '',
			clip: [0, 0, 32, 32],
			inherit: '',
			attributes: [],
			events: [],
			scripts: []
		};
	};

	// 打开数据
	FileSkill.open = function (skill, meta) {
		if (this.meta !== meta) {
			this.target = skill;
			this.meta = meta;

			// 写入数据
			const write = getElementWriter('fileSkill', skill);
			write('icon');
			write('clip');
			write('inherit');
			write('attributes');
			write('events');
			write('scripts');
		}
	};

	// 关闭数据
	FileSkill.close = function () {
		if (this.target) {
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			$('#fileSkill-attributes').clear();
			$('#fileSkill-events').clear();
			$('#fileSkill-scripts').clear();
			$('#fileSkill-parameter-pane').clear();
		}
	};

	// 更新数据
	FileSkill.update = function (skill, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'icon':
			case 'clip':
				if (skill[key] !== value) {
					skill[key] = value;
					Browser.body.updateIcon(this.meta.file);
				}
				break;
			case 'inherit':
				if (skill[key] !== value) {
					skill[key] = value;
				}
				break;
		}
	};

	// 参数 - 输入事件
	FileSkill.paramInput = function (event) {
		FileSkill.update(FileSkill.target, Inspector.getKey(this), this.read());
	};

	// 列表 - 改变事件
	FileSkill.listChange = function (event) {
		File.planToSave(FileSkill.meta);
	};

	Inspector.fileSkill = FileSkill;
}
