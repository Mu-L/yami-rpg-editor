import { $ } from '@/util/dom.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { File } from '@/file/file-system-core.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { Codec } from '@/codec/codec.ts';
import { Menu } from '@/components/menu-list.ts';
import { Data } from './data-object.ts';
import { Easing } from './transition-window.ts';
import { GUID } from '@/file/guid.ts';
import { Color } from '@/tools/color-picker-window.ts';
import { Local } from '@/tools/localization.ts';
import { Window } from '@/tools/window-object.ts';

export const Team = {
	list: $('#team-list'),
	data: null,
	maximum: null,
	changed: false,
	initialize: null,
	open: null,
	createId: null,
	createData: null,
	getItemById: null,
	unpackTeams: null,
	packTeams: null,
	windowClose: null,
	windowClosed: null,
	listKeydown: null,
	listPointerdown: null,
	listSelect: null,
	listChange: null,
	listPopup: null,
	confirm: null
};

Team.list.insert = null;
Team.list.copy = null;
Team.list.paste = null;
Team.list.delete = null;
Team.list.saveSelection = null;
Team.list.restoreSelection = null;
Team.list.updateNodeElement = Easing.list.updateNodeElement;
Team.list.createIcon = null;
Team.list.updateIcon = null;
Team.list.updateItemName = null;
Team.list.addElementClass = Easing.list.addElementClass;
Team.list.updateTextNode = Easing.list.updateTextNode;
Team.list.createMarks = null;
Team.list.updateMarks = null;

Team.initialize = function () {
	this.maximum = 256;

	const { list } = this;
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.data);
	list.creators.push(list.addElementClass);
	list.creators.push(list.createIcon);
	list.updaters.push(list.updateTextNode);
	list.creators.push(list.createMarks);
	list.updaters.push(list.updateMarks);

	$('#team').on('close', this.windowClose);
	$('#team').on('closed', this.windowClosed);
	list.on('keydown', this.listKeydown);
	list.on('pointerdown', this.listPointerdown);
	list.on('select', this.listSelect);
	list.on('change', this.listChange);
	list.on('popup', this.listPopup);
	$('#team-confirm').on('click', this.confirm);
};

Team.open = function (data) {
	Window.open('team');

	this.unpackTeams();

	this.list.restoreSelection();

	this.list.getFocus();
};

Team.createId = function () {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.getItemById(id));
	return id;
};

Team.createData = function () {
	const id = this.createId();
	const relations = {};
	const collisions = {};
	const teams = this.data;
	for (const { id } of teams) {
		relations[id] = 1;
		collisions[id] = 1;
	}
	relations[id] = 1;
	collisions[id] = 1;
	return {
		id: id,
		name: '',
		color: '000000ff',
		relations: relations,
		collisions: collisions
	};
};

Team.getItemById = Easing.getItemById;

Team.unpackTeams = function () {
	const items = Data.teams.list;
	const length = items.length;
	const sRelations = Codec.decodeTeamData(Data.teams.relations, length);
	const sCollisions = Codec.decodeTeamData(Data.teams.collisions, length);
	const copies = new Array(length);
	const a = length * 2;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		const dRelations = {};
		const dCollisions = {};
		for (let j = 0; j < i; j++) {
			const ri = ((a - j + 1) / 2) * j - j + i;
			const id = items[j].id;
			dRelations[id] = sRelations[ri];
			dCollisions[id] = sCollisions[ri];
		}
		const b = ((a - i + 1) / 2) * i - i;
		for (let j = i; j < length; j++) {
			const ri = b + j;
			const id = items[j].id;
			dRelations[id] = sRelations[ri];
			dCollisions[id] = sCollisions[ri];
		}
		copies[i] = {
			id: item.id,
			name: item.name,
			color: item.color,
			relations: dRelations,
			collisions: dCollisions
		};
	}
	this.data = copies;
};

Team.packTeams = function () {
	const items = this.data;
	const length = items.length;
	const copies = new Array(length);
	const dRelations = GL.arrays[0].uint8;
	const dCollisions = GL.arrays[1].uint8;
	let ri = 0;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		const sRelations = item.relations;
		const sCollisions = item.collisions;
		for (let j = i; j < length; j++, ri++) {
			const id = items[j].id;
			dRelations[ri] = sRelations[id];
			dCollisions[ri] = sCollisions[id];
		}
		copies[i] = {
			id: item.id,
			name: item.name,
			color: item.color
		};
	}
	Data.teams.list = copies;
	Data.teams.relations = Codec.encodeTeamData(new Uint8Array(dRelations.buffer, 0, ri));
	Data.teams.collisions = Codec.encodeTeamData(new Uint8Array(dCollisions.buffer, 0, ri));
	Data.createTeamMap();
};

Team.windowClose = function (event) {
	if (Team.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedTeams')
			},
			[
				{
					label: get('yes'),
					click: () => {
						Team.changed = false;
						Window.close('team');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Team.windowClosed = function (event) {
	this.data = null;
	this.list.clear();
}.bind(Team);

Team.listKeydown = function (event) {
	const item = this.read();
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				this.insert(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
		}
	}
};

Team.listPointerdown = function (event) {
	switch (event.button) {
		case 0:
			if (event.target.hasClass('team-icon')) {
				const element = event.target.parentNode;
				const team = element.item;
				return Color.open({
					read: () => {
						return team.color;
					},
					input: (color) => {
						team.color = color;
						this.updateIcon(team);
						Team.changed = true;
					}
				});
			}
			if (event.target.hasClass('team-relation-mark')) {
				const element = event.target.parentNode;
				const teamA = this.read();
				const teamB = element.item;
				teamA.relations[teamB.id] ^= 1;
				if (teamA !== teamB) {
					teamB.relations[teamA.id] ^= 1;
				}
				this.updateMarks(teamB);
				Team.changed = true;
			}
			if (event.target.hasClass('team-collision-mark')) {
				const element = event.target.parentNode;
				const teamA = this.read();
				const teamB = element.item;
				teamA.collisions[teamB.id] ^= 1;
				if (teamA !== teamB) {
					teamB.collisions[teamA.id] ^= 1;
				}
				this.updateMarks(teamB);
				Team.changed = true;
			}
			break;
	}
};

Team.listSelect = function (event) {
	for (const team of this.data) {
		const element = team.element;
		if (element !== undefined) {
			element.changed = true;
			if (element.parentNode) {
				this.updateMarks(team);
			}
		}
	}
};

Team.listChange = function (event) {
	Team.changed = true;
};

Team.listPopup = function (event) {
	const item = event.value;
	const length = Team.data.length;
	const selected = !!item;
	const insertable = length < Team.maximum;
	const pastable = insertable && (Clipboard as any).has('yami.data.team');
	const deletable = selected && length > 1;
	const get = Local.createGetter('menuTeamList');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('insert'),
				accelerator: 'Insert',
				enabled: insertable,
				click: () => {
					this.insert(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					this.copy(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.paste(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					this.delete(item);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: selected,
				click: () => {
					this.rename(item);
				}
			}
		]
	);
};

Team.confirm = function (event) {
	if (this.changed) {
		this.changed = false;
		this.packTeams();
		File.planToSave(Data.manifest.project.teams);
		const datachange = new Event('datachange');
		datachange.key = 'teams';
		window.dispatchEvent(datachange);
	}
	Window.close('team');
}.bind(Team);

Team.list.insert = function (dItem) {
	if (this.data.length < Team.maximum) {
		const team = Team.createData();
		const id = team.id;
		for (const item of this.data) {
			item.relations[id] = 1;
			item.collisions[id] = 1;
		}
		this.addNodeTo(team, dItem);
	}
};

Team.list.copy = function (item) {
	if (item) {
		(Clipboard as any).write('yami.data.team', item);
	}
};

Team.list.paste = function (dItem) {
	const copy = (Clipboard as any).read('yami.data.team');
	if (copy) {
		const dId = Team.createId();
		const cRelations = copy.relations;
		const cCollisions = copy.collisions;
		const dRelations = {};
		const dCollisions = {};
		for (const item of this.data) {
			const sId = item.id;
			const sRelations = item.relations;
			const sCollisions = item.collisions;
			const r = cRelations[sId] ?? 1;
			const c = cCollisions[sId] ?? 1;
			sRelations[dId] = r;
			sCollisions[dId] = c;
			dRelations[sId] = r;
			dCollisions[sId] = c;
		}
		dRelations[dId] = 1;
		dCollisions[dId] = 1;
		copy.name += ' - Copy';
		copy.id = dId;
		copy.relations = dRelations;
		copy.collisions = dCollisions;
		this.addNodeTo(copy, dItem);
	}
};

Team.list.delete = function (item) {
	const items = this.data;
	if (items.length > 1) {
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('deleteSingleFile').replace('<filename>', item.name)
			},
			[
				{
					label: get('yes'),
					click: () => {
						const id = item.id;
						for (const item of items) {
							delete item.relations[id];
						}
						const index = items.indexOf(item);
						this.deleteNode(item);
						const last = items.length - 1;
						this.select(items[Math.min(index, last)]);
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Team.list.saveSelection = function () {
	const { teams } = Data;
	if (teams.selection === undefined) {
		Object.defineProperty(teams, 'selection', {
			writable: true,
			value: ''
		});
	}
	const selection = this.read();
	if (selection) {
		teams.selection = selection.id;
	}
};

Team.list.restoreSelection = function () {
	const id = Data.teams.selection;
	const item = Team.getItemById(id) ?? this.data[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

Team.list.createIcon = function (item) {
	const { element } = item;
	const icon = document.createElement('node-icon');
	icon.addClass('team-icon');
	element.nodeIcon = icon;
	element.insertBefore(icon, element.textNode);
	Team.list.updateIcon(item);
};

Team.list.updateIcon = function (item) {
	const icon = item.element.nodeIcon;
	const color = item.color;
	if (icon.color !== color) {
		icon.color = color;
		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);
		const a = parseInt(color.slice(6, 8), 16) / 255;
		icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	}
};

Team.list.updateItemName = function (item) {
	this.updateTextNode(item);
};

Team.list.createMarks = function (item) {
	const { element } = item;
	const relationMark = document.createElement('text');
	relationMark.addClass('team-relation-mark');
	element.relationMark = relationMark;
	element.appendChild(relationMark);
	const collisionMark = document.createElement('text');
	collisionMark.addClass('team-collision-mark');
	collisionMark.textContent = '\uf066';
	element.collisionMark = collisionMark;
	element.appendChild(collisionMark);
};

Team.list.updateMarks = function (item) {
	const selection = Team.list.read();
	if (selection === null) return;
	const relationMark = item.element.relationMark;
	const relations = selection.relations;
	const relation = relations[item.id];
	if (relationMark.relation !== relation) {
		relationMark.relation = relation;
		switch (relation) {
			case 0:
				relationMark.removeClass('friend');
				relationMark.addClass('enemy');
				relationMark.textContent = '\uf119';
				break;
			case 1:
				relationMark.removeClass('enemy');
				relationMark.addClass('friend');
				relationMark.textContent = '\uf118';
				break;
		}
	}
	const collisionMark = item.element.collisionMark;
	const collisions = selection.collisions;
	const collision = collisions[item.id];
	if (collisionMark.collision !== collision) {
		collisionMark.collision = collision;
		switch (collision) {
			case 0:
				collisionMark.removeClass('on');
				break;
			case 1:
				collisionMark.addClass('on');
				break;
		}
	}
};
