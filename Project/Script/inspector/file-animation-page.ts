import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Command } from '@/command/command-object.ts';
import { GUID } from '@/file/guid.ts';
import { Inspector } from './inspector.ts';
import { Window } from '@/tools/window-object.ts';

{
	const FileAnimation = {
		button: $('#animation-switch-settings'),
		owner: null,
		target: null,
		sprites: null,
		initialize: null,
		create: null,
		open: null,
		close: null
	};

	FileAnimation.initialize = function () {
		this.owner = {
			setTarget: (target) => {
				if (this.target !== target) {
					Inspector.open('fileAnimation', target);
				}
			},
			planToSave: () => {
				Animation.planToSave();
			},
			get history() {
				return Animation.history;
			}
		};

		$('#fileAnimation-sprites').bind(this.sprites);

		$('#fileAnimation-sprites').on('change', Animation.listChange);
	};

	FileAnimation.create = function () {
		return {
			sprites: [],
			motions: []
		};
	};

	FileAnimation.open = function (animation) {
		if (this.target !== animation) {
			this.target = animation;

			this.button.addClass('selected');

			const write = getElementWriter('fileAnimation', animation);
			write('sprites');
		}
	};

	FileAnimation.close = function () {
		if (this.target) {
			this.target = null;

			this.button.removeClass('selected');
		}
	};

	FileAnimation.sprites = {
		list: null,
		spriteId: '',
		initialize: function (list) {
			$('#fileAnimation-sprite-confirm').on('click', () => list.save());

			this.list = list;

			this.history = new Inspector.ParamHistory(FileAnimation, FileAnimation.owner, list);

			// 重载动画纹理 - 改变事件
			list.on('change', () => {
				if (Animation.sprites) {
					if (Animation.sprites.listItems) {
						Animation.sprites.listItems = undefined;
					}
					Animation.loadTextures();
				}
			});
		},
		parse: function ({ name, image, hframes, vframes }) {
			const fileName = Command.removeTextTags(Command.parseFileName(image));
			return [name, `${fileName} [${hframes}x${vframes}]`];
		},
		createExclusionMap: function () {
			const exclusions = {};
			for (const sprite of this.list.data) {
				exclusions[sprite.id] = true;
			}
			return exclusions;
		},
		createSpriteId: function (exclusions = this.createExclusionMap()) {
			let id;
			do {
				id = GUID.generate64bit();
			} while (exclusions[id]);
			return id;
		},
		open: function ({
			name = '',
			id = this.createSpriteId(),
			image = '',
			hframes = 1,
			vframes = 1
		} = {}) {
			Window.open('fileAnimation-sprite');
			const write = getElementWriter('fileAnimation-sprite');
			write('name', name);
			write('image', image);
			write('hframes', hframes);
			write('vframes', vframes);
			this.spriteId = id;
			if (!name) {
				$('#fileAnimation-sprite-name').getFocus();
			} else {
				$('#fileAnimation-sprite-image').getFocus();
			}
		},
		save: function () {
			const read = getElementReader('fileAnimation-sprite');
			const name = read('name').trim();
			if (!name) {
				return $('#fileAnimation-sprite-name').getFocus();
			}
			const image = read('image');
			const hframes = read('hframes');
			const vframes = read('vframes');
			const id = this.spriteId;
			Window.close('fileAnimation-sprite');
			return { name, id, image, hframes, vframes };
		},
		onPaste: function (list, copies) {
			const exclusions = this.createExclusionMap();
			for (const sprite of copies) {
				if (sprite.id in exclusions) {
					const id = this.createSpriteId(exclusions);
					sprite.id = id;
				}
				exclusions[sprite.id] = true;
			}
		}
	};

	Inspector.fileAnimation = FileAnimation;
}
