import { Command } from '../command/command-object.ts';
import { Attribute } from '../attribute/attribute-window.ts';
import { Browser } from '../browser/project-browser.ts';
import { Selector } from '../browser/resource-selector.ts';
import { ActorGetter } from '../command/actor-accessor-window.ts';
import { AncestorGetter } from '../command/ancestor-accessor-window.ts';
import { AngleGetter } from '../command/angle-accessor-window.ts';
import { ElementGetter } from '../command/element-accessor-window.ts';
import { EquipmentGetter } from '../command/equipment-accessor-window.ts';
import { ItemGetter } from '../command/item-accessor-window.ts';
import { LightGetter } from '../command/light-accessor-window.ts';
import { PositionGetter } from '../command/position-accessor-window.ts';
import { RegionGetter } from '../command/region-accessor-window.ts';
import { ObjectGetter } from '../command/scene-object-accessor-window.ts';
import { SkillGetter } from '../command/skill-accessor-window.ts';
import { StateGetter } from '../command/state-accessor-window.ts';
import { TilemapGetter } from '../command/tilemap-accessor-window.ts';
import { TriggerGetter } from '../command/trigger-accessor-window.ts';
import { VariableGetter } from '../command/variable-accessor-window.ts';
import { Enum } from '../enum/enum-window.ts';
import { FileItem } from '../file/file-item.ts';
import { File } from '../file/file-system-core.ts';
import { GameLocal } from '../local/local-object.ts';
import { ArrayList } from '../tools/array-window.ts';
import { ImageClip } from '../tools/image-crop-window.ts';
import { Local } from '../tools/localization.ts';
import { PresetElement } from '../tools/preset-element-window.ts';
import { PresetObject } from '../tools/scene-preset-window.ts';
import { Variable } from '../variable/variable.ts';

// ******************************** 自定义框 ********************************

export class CustomBox extends HTMLElement {
	info: HTMLElement;
	dataValue: any;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;

	constructor() {
		super();

		// 创建文本
		const text = document.createElement('text');
		text.addClass('custom-box-text');
		this.appendChild(text);

		// 设置属性
		this.tabIndex = 0;
		this.info = text;
		this.dataValue = null;
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;

		// 侦听事件
		this.on('keydown', this.keydown);
		this.on('click', this.click);
		this.on('dragenter', this.dragenter);
		this.on('dragleave', this.dragleave);
		this.on('dragover', this.dragover);
		this.on('drop', this.drop);
	}

	// 获取类型属性
	get type(): string | null {
		return this.getAttribute('type');
	}

	set type(value: string) {
		this.setAttribute('type', value);
	}

	// 获取过滤属性
	get filter(): string | null {
		return this.getAttribute('filter');
	}

	set filter(value: string) {
		this.setAttribute('filter', value);
	}

	// 读取数据
	read(): any {
		return this.dataValue;
	}

	// 写入数据
	write(value: any): void {
		this.dataValue = value;
		this.update();
		if (this.writeEventEnabled) {
			const write: any = new Event('write');
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

	// 输入数据
	input(value: any): void {
		if (this.dataValue !== value) {
			this.write(value);
			if (this.inputEventEnabled) {
				const input: any = new Event('input');
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			this.dispatchChangeEvent();
		} else {
			if (this.type === 'file') {
				this.update();
			}
		}
	}

	// 更新信息
	update(): void {
		this.info.removeClass('invalid');
		const value = this.dataValue;
		switch (this.type) {
			case 'file':
				return this.updateFile(value);
			case 'dialog-dir':
				return this.updateDialogDir(value);
			case 'clip':
				return this.updateClip(value);
			case 'variable':
				return this.updateVariable(value);
			case 'global-variable':
				return this.updateGlobalVariable(value);
			case 'actor':
				return this.updateActor(value);
			case 'skill':
				return this.updateSkill(value);
			case 'state':
				return this.updateState(value);
			case 'equipment':
				return this.updateEquipment(value);
			case 'item':
				return this.updateItem(value);
			case 'position':
				return this.updatePosition(value);
			case 'angle':
				return this.updateAngle(value);
			case 'trigger':
				return this.updateTrigger(value);
			case 'light':
				return this.updateLight(value);
			case 'region':
				return this.updateRegion(value);
			case 'tilemap':
				return this.updateTilemap(value);
			case 'object':
				return this.updateObject(value);
			case 'element':
			case 'ancestor-element':
				return this.updateElement(value);
			case 'preset-object':
				return this.updatePresetObject(value);
			case 'preset-element':
				return this.updatePresetElement(value);
			case 'array':
				return this.updateArray(value);
			case 'attribute':
				return this.updateAttribute(value);
			case 'attribute-group':
				return this.updateAttributeGroup(value);
			case 'enum-group':
				return this.updateEnumGroup(value);
			case 'enum-string':
				return this.updateEnumString(value);
		}
	}

	// 更新文件信息
	updateFile(guid: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(
			Command.parseFileName(guid)
		);
		if (Command.invalid) this.info.addClass('invalid');
	}

	// 更新对话框目录
	updateDialogDir(path: string): void {
		this.info.textContent = path;
	}

	// 打开对话框目录
	openDialogDir(input: { read(): any; write(v: any): void }): void {
		File.showOpenDialog({
			defaultPath: input.read(),
			properties: ['openDirectory']
		}).then(({ filePaths }: { filePaths: string[] }) => {
			if (filePaths.length === 1) {
				input.write(filePaths[0]);
			}
		});
	}

	// 更新图像剪辑信息
	updateClip(clip: number[]): void {
		this.info.textContent = clip.join(', ');
	}

	// 更新变量信息
	updateVariable(variable: any): void {
		// 类型是独立变量，或存在变量键，则判定为有效变量
		if (variable.type === 'self' || variable.key) {
			this.info.textContent = Command.removeTextTags(
				Command.parseVariable(variable)
			);
		} else {
			this.info.textContent = Local.get('common.none');
		}
	}

	// 更新全局变量信息
	updateGlobalVariable(id: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseGlobalVariable(id)
		);
	}

	// 更新角色信息
	updateActor(actor: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseActor(actor)
		);
	}

	// 更新技能信息
	updateSkill(skill: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseSkill(skill)
		);
	}

	// 更新状态信息
	updateState(state: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseState(state)
		);
	}

	// 更新装备信息
	updateEquipment(equipment: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseEquipment(equipment)
		);
	}

	// 更新物品信息
	updateItem(item: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseItem(item));
	}

	// 更新位置信息
	updatePosition(point: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parsePosition(point)
		);
	}

	// 更新角度信息
	updateAngle(angle: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseAngle(angle)
		);
	}

	// 更新触发器信息
	updateTrigger(trigger: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseTrigger(trigger)
		);
	}

	// 更新光源信息
	updateLight(light: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseLight(light)
		);
	}

	// 更新区域信息
	updateRegion(region: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseRegion(region)
		);
	}

	// 更新瓦片地图信息
	updateTilemap(tilemap: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseTilemap(tilemap)
		);
	}

	// 更新场景对象信息
	updateObject(object: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parseObject(object)
		);
	}

	// 更新元素信息
	updateElement(element: any): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(
			Command.parseElement(element)
		);
		if (Command.invalid) this.info.addClass('invalid');
	}

	// 更新预设对象信息
	updatePresetObject(preset: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parsePresetObject(preset)
		);
	}

	// 更新预设元素信息
	updatePresetElement(preset: any): void {
		this.info.textContent = Command.removeTextTags(
			Command.parsePresetElement(preset)
		);
		if (Command.invalid) this.info.addClass('invalid');
	}

	// 更新数组信息
	updateArray(array: any[]): void {
		this.info.textContent =
			array.length !== 0
				? Command.parseMultiLineString(array.join(', '))
				: Local.get('common.empty');
	}

	// 更新属性群组信息
	updateAttributeGroup(groupId: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(
			Command.parseAttributeGroup(groupId)
		);
		if (Command.invalid) this.info.addClass('invalid');
	}

	// 更新属性信息
	updateAttribute(attrId: string): void {
		if (attrId === '') {
			this.info.textContent = Local.get('common.none');
			return;
		}
		const attribute = (Attribute as any).getAttribute(attrId);
		if (attribute) {
			this.info.textContent = GameLocal.replace(attribute.name);
		} else {
			this.info.textContent = Command.parseUnlinkedId(attrId);
			this.info.addClass('invalid');
		}
	}

	// 更新枚举群组信息
	updateEnumGroup(groupId: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(
			Command.parseEnumGroup(groupId)
		);
		if (Command.invalid) this.info.addClass('invalid');
	}

	// 更新枚举字符串信息
	updateEnumString(stringId: string): void {
		if (stringId === '') {
			this.info.textContent = Local.get('common.none');
			return;
		}
		const string = (Enum as any).getString(stringId);
		if (string) {
			this.info.textContent = GameLocal.replace(string.name);
		} else {
			this.info.textContent = Command.parseUnlinkedId(stringId);
			this.info.addClass('invalid');
		}
	}

	// 启用元素
	enable(): void {
		if (this.removeClass('disabled')) {
			this.tabIndex += 1;
			this.showChildNodes();
		}
	}

	// 禁用元素
	disable(): void {
		if (this.addClass('disabled')) {
			this.tabIndex -= 1;
			this.hideChildNodes();
		}
	}

	// 添加事件
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	}

	// 键盘按下事件
	keydown(event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					this.click(event);
				}
				break;
		}
	}

	// 鼠标点击事件
	// 鼠标点击事件（event 可选，兼容基类 HTMLElement.click() 无参契约）
	click(event?: Event): void {
		switch (this.type) {
			case 'file':
				return (Selector as any).open(this);
			case 'dialog-dir':
				return this.openDialogDir(this);
			case 'clip':
				return (ImageClip as any).open(this);
			case 'variable':
				return (VariableGetter as any).open(this);
			case 'global-variable':
				return (Variable as any).open(this);
			case 'actor':
				return (ActorGetter as any).open(this);
			case 'skill':
				return (SkillGetter as any).open(this);
			case 'state':
				return (StateGetter as any).open(this);
			case 'equipment':
				return (EquipmentGetter as any).open(this);
			case 'item':
				return (ItemGetter as any).open(this);
			case 'position':
				return (PositionGetter as any).open(this);
			case 'angle':
				return (AngleGetter as any).open(this);
			case 'trigger':
				return (TriggerGetter as any).open(this);
			case 'light':
				return (LightGetter as any).open(this);
			case 'region':
				return (RegionGetter as any).open(this);
			case 'tilemap':
				return (TilemapGetter as any).open(this);
			case 'object':
				return (ObjectGetter as any).open(this);
			case 'element':
				return (ElementGetter as any).open(this);
			case 'ancestor-element':
				return (AncestorGetter as any).open(this);
			case 'preset-object':
				return (PresetObject as any).open(this);
			case 'preset-element':
				return (PresetElement as any).open(this);
			case 'array':
				return (ArrayList as any).open(this);
			case 'attribute':
				return (Attribute as any).open(this, 'attribute');
			case 'attribute-group':
				return (Attribute as any).open(this, 'group');
			case 'enum-group':
				return (Enum as any).open(this, 'group');
			case 'enum-string':
				return (Enum as any).open(this, 'string');
		}
	}

	// 拖拽进入事件
	dragenter(event: DragEvent): void {
		return this.dragover(event);
	}

	// 拖拽离开事件
	dragleave(event: DragEvent): void {
		if (!this.contains(event.relatedTarget as Node)) {
			this.removeClass('dragover');
		}
	}

	// 拖拽悬停事件
	dragover(event: DragEvent): void {
		if (this.type === 'file' && (Browser as any).dragging) {
			const file = (Browser.body as any).activeFile;
			if (
				file instanceof FileItem &&
				(!this.filter || this.filter.indexOf((file as any).type) !== -1)
			) {
				(event as any).dataTransfer.dropEffect = 'move';
				event.preventDefault();
				this.addClass('dragover');
			}
		}
	}

	// 拖拽释放事件
	drop(event: DragEvent): void {
		const file = (Browser.body as any).activeFile;
		if (file instanceof FileItem) {
			this.focus();
			this.input((file.meta as any).guid);
			this.removeClass('dragover');
		}
	}
}

customElements.define('custom-box', CustomBox as any);
