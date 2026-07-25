import { Scene } from './scene-window.ts';
import { History } from '../tools/history.ts';
(() => {
	let tilemap = null;
	let mapData = null;
	let changes = null;
	let states = null;
	let count = 0;
	let length = 0;

	Scene.beginMapRecord = function () {
		switch (this.layer) {
			case 'tilemap':
				tilemap = this.tilemap;
				mapData = tilemap.tiles;
				break;
			case 'terrain':
				tilemap = null;
				mapData = this.terrains;
				break;
		}
		if (length < mapData.length) {
			length = mapData.length;
			changes = new Uint32Array(length * 2);
			states = new Uint8Array(length);
		}
	};

	Scene.closeMapRecord = function () {
		if (mapData !== null) {
			tilemap = null;
			mapData = null;
			changes = null;
			states = null;
			count = 0;
			length = 0;
		}
	};

	Scene.saveMapRecord = function () {
		if (count === 0) return;
		if (tilemap) {
			tilemap.changed = true;
			this.history.save({
				type: 'scene-tilemap-change',
				tilemap: tilemap,
				changes: changes.slice(0, count),
				tilesetMap: tilemap.tilesetMap
			});
		} else {
			this.planToSaveTerrains();
			this.history.save({
				type: 'scene-terrain-change',
				terrains: mapData,
				changes: changes.slice(0, count)
			});
		}
		for (let i = 0; i < count; i += 2) {
			states[changes[i]] = 0;
		}
		count = 0;
	};

	Scene.recordMapData = function (index) {
		if (states[index] === 0) {
			states[index] = 1;
			changes[count] = index;
			changes[count + 1] = mapData[index];
			count += 2;
		}
	};

	Scene.restoreMapData = function () {
		for (let i = count - 2; i >= 0; i -= 2) {
			const index = changes[i];
			mapData[index] = changes[i + 1];
			states[index] = 0;
		}
		count = 0;
	};

	Scene.undoMapData = function (mapData, changes) {
		const length = changes.length;
		for (let i = length - 1; i > 0; i -= 2) {
			const ti = changes[i - 1];
			const code = changes[i];
			changes[i] = mapData[ti];
			mapData[ti] = code;
		}
	};

	Scene.redoMapData = function (mapData, changes) {
		const length = changes.length;
		for (let i = 1; i < length; i += 2) {
			const ti = changes[i - 1];
			const code = changes[i];
			changes[i] = mapData[ti];
			mapData[ti] = code;
		}
	};
})();

Scene.createHistory = (function IIFE() {
	const onSave = (data) => {
		data.layer = Scene.tilemap ?? Scene.layer;
	};
	const onRestore = (data) => {
		const { layer } = data;
		switch (layer) {
			case 'object':
			case 'terrain':
				Scene.switchLayer(layer);
				break;
			default:
				Scene.openTilemap(layer);
				break;
		}
	};
	return function () {
		const history = new History(100);
		history.onSave = onSave;
		history.onRestore = onRestore;
		return history;
	};
})();
