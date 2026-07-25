import { $ } from '../util/dom.ts';
import { Scene } from './scene-window.ts';

interface TilemapData {
	shortcut: number;
	name: string;
	[k: string]: any;
}

export class TilemapShortcuts {
	tilemaps: TilemapData[];
	// 索引 1-6 挂载对应快捷方式的 tilemap（reset 时初始化为 null）
	[index: number]: TilemapData | null;

	constructor(tilemaps: TilemapData[]) {
		this.tilemaps = tilemaps;
		this.reset();
	}

	reset(): void {
		this[1] = null;
		this[2] = null;
		this[3] = null;
		this[4] = null;
		this[5] = null;
		this[6] = null;
	}

	update(): void {
		this.reset();
		for (const tilemap of this.tilemaps) {
			const { shortcut } = tilemap;
			if (shortcut !== 0) {
				this[shortcut] = tilemap;
			}
		}
		const { elements } = TilemapShortcuts;
		const opening = Scene.tilemap;
		for (let i = 1; i <= 6; i++) {
			const element = elements[i];
			const tilemap = this[i];
			if (tilemap) {
				tilemap === opening && element.addClass('selected');
				element.show();
			} else {
				element.removeClass('selected');
				element.hide();
			}
		}
		Scene.head.width = 0;
		Scene.updateHead();
	}

	getEmptyIndex(): number {
		for (let i = 1; i <= 6; i++) {
			if (!this[i]) return i;
		}
		return 0;
	}

	static elements = {
		1: $('#scene-layer-tilemap-1'),
		2: $('#scene-layer-tilemap-2'),
		3: $('#scene-layer-tilemap-3'),
		4: $('#scene-layer-tilemap-4'),
		5: $('#scene-layer-tilemap-5'),
		6: $('#scene-layer-tilemap-6')
	};

	static initialize(): void {
		const { elements } = this;
		for (let i = 1; i <= 6; i++) {
			elements[i].setTooltip(() => {
				const tilemap = Scene.tilemaps?.shortcuts[i];
				return tilemap ? `<b>${tilemap.name}</b>` : '';
			});
		}
	}
}
