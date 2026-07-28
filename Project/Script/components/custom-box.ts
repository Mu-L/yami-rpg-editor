import { Command } from '@/command/command-object.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { Browser } from '@/browser/project-browser.ts';
import { Selector } from '@/browser/resource-selector.ts';
import { ActorGetter } from '@/command/actor-accessor-window.ts';
import { AncestorGetter } from '@/command/ancestor-accessor-window.ts';
import { AngleGetter } from '@/command/angle-accessor-window.ts';
import { ElementGetter } from '@/command/element-accessor-window.ts';
import { EquipmentGetter } from '@/command/equipment-accessor-window.ts';
import { ItemGetter } from '@/command/item-accessor-window.ts';
import { LightGetter } from '@/command/preset-accessor-factory.ts';
import { PositionGetter } from '@/command/position-accessor-window.ts';
import { RegionGetter } from '@/command/region-accessor-window.ts';
import { ObjectGetter } from '@/command/preset-accessor-factory.ts';
import { SkillGetter } from '@/command/skill-accessor-window.ts';
import { StateGetter } from '@/command/state-accessor-window.ts';
import { TilemapGetter } from '@/command/tilemap-accessor-window.ts';
import { TriggerGetter } from '@/command/trigger-accessor-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { GameLocal } from '@/local/local-object.ts';
import { ArrayList } from '@/tools/array-window.ts';
import { ImageClip } from '@/tools/image-crop-window.ts';
import { Local } from '@/tools/localization.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { Variable } from '@/variable/variable.ts';

export class CustomBox extends HTMLElement {
	info: HTMLElement;
	dataValue: any;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;

	constructor() {
		super();

		const text = document.createElement('text');
		text.addClass('custom-box-text');
		this.appendChild(text);

		this.tabIndex = 0;
		this.info = text;
		this.dataValue = null;
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;

		this.on('keydown', this.keydown);
		this.on('click', this.click);
		this.on('dragenter', this.dragenter);
		this.on('dragleave', this.dragleave);
		this.on('dragover', this.dragover);
		this.on('drop', this.drop);
	}

	get type(): string | null {
		return this.getAttribute('type');
	}

	set type(value: string) {
		this.setAttribute('type', value);
	}

	get filter(): string | null {
		return this.getAttribute('filter');
	}

	set filter(value: string) {
		this.setAttribute('filter', value);
	}

	read(): any {
		return this.dataValue;
	}

	write(value: any): void {
		this.dataValue = value;
		this.update();
		if (this.writeEventEnabled) {
			const write: any = new Event('write');
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

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

	updateFile(guid: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(Command.parseFileName(guid));
		if (Command.invalid) this.info.addClass('invalid');
	}

	updateDialogDir(path: string): void {
		this.info.textContent = path;
	}

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

	updateClip(clip: number[]): void {
		this.info.textContent = clip.join(', ');
	}

	updateVariable(variable: any): void {
		if (variable.type === 'self' || variable.key) {
			this.info.textContent = Command.removeTextTags(Command.parseVariable(variable));
		} else {
			this.info.textContent = Local.get('common.none');
		}
	}

	updateGlobalVariable(id: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseGlobalVariable(id));
	}

	updateActor(actor: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseActor(actor));
	}

	updateSkill(skill: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseSkill(skill));
	}

	updateState(state: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseState(state));
	}

	updateEquipment(equipment: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseEquipment(equipment));
	}

	updateItem(item: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseItem(item));
	}

	updatePosition(point: any): void {
		this.info.textContent = Command.removeTextTags(Command.parsePosition(point));
	}

	updateAngle(angle: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseAngle(angle));
	}

	updateTrigger(trigger: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseTrigger(trigger));
	}

	updateLight(light: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseLight(light));
	}

	updateRegion(region: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseRegion(region));
	}

	updateTilemap(tilemap: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseTilemap(tilemap));
	}

	updateObject(object: any): void {
		this.info.textContent = Command.removeTextTags(Command.parseObject(object));
	}

	updateElement(element: any): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(Command.parseElement(element));
		if (Command.invalid) this.info.addClass('invalid');
	}

	updatePresetObject(preset: any): void {
		this.info.textContent = Command.removeTextTags(Command.parsePresetObject(preset));
	}

	updatePresetElement(preset: any): void {
		this.info.textContent = Command.removeTextTags(Command.parsePresetElement(preset));
		if (Command.invalid) this.info.addClass('invalid');
	}

	updateArray(array: any[]): void {
		this.info.textContent =
			array.length !== 0
				? Command.parseMultiLineString(array.join(', '))
				: Local.get('common.empty');
	}

	updateAttributeGroup(groupId: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(Command.parseAttributeGroup(groupId));
		if (Command.invalid) this.info.addClass('invalid');
	}

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

	updateEnumGroup(groupId: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags(Command.parseEnumGroup(groupId));
		if (Command.invalid) this.info.addClass('invalid');
	}

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

	enable(): void {
		if (this.removeClass('disabled')) {
			this.tabIndex += 1;
			this.showChildNodes();
		}
	}

	disable(): void {
		if (this.addClass('disabled')) {
			this.tabIndex -= 1;
			this.hideChildNodes();
		}
	}

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

	dragenter(event: DragEvent): void {
		return this.dragover(event);
	}

	dragleave(event: DragEvent): void {
		if (!this.contains(event.relatedTarget as Node)) {
			this.removeClass('dragover');
		}
	}

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
