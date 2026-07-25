import { Data } from '@/data/data-object.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { UI } from '@/ui/ui-window.ts';
import { Updater } from './updater.ts';

Updater.updateElements = function (verNum) {
	const replaceUIElement = (replacer) => {
		const forEachElement = (nodes, replacer, meta) => {
			const length = nodes.length;
			for (let i = 0; i < length; i++) {
				const node = nodes[i];
				const replacement = replacer(node);
				if (replacement instanceof Object) {
					nodes[i] = replacement;
					File.planToSave(meta);
				}
				if (node.children instanceof Array) {
					forEachElement(node.children, replacer, meta);
				}
			}
		};
		for (const [guid, ui] of Object.entries(Data.ui)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			forEachElement((ui as any).nodes, replacer, meta);
		}
	};
	if (verNum < Updater.getVersionNumber('1.0.40')) {
		const keys = Object.keys(Inspector.uiButton.create());
		replaceUIElement((sNode) => {
			if (sNode.class === 'button') {
				const dNode = Inspector.uiButton.create();
				for (const key of keys) {
					if (key in sNode) {
						dNode[key] = sNode[key];
						continue;
					}
					switch (key) {
						case 'normalClip':
						case 'hoverClip':
						case 'activeClip':
							dNode[key] = sNode.clip.slice();
							continue;
						case 'textPadding':
							dNode[key] = sNode.padding;
							continue;
					}
				}
				return dNode;
			}
		});
	}
	if (verNum < Updater.getVersionNumber('1.0.61')) {
		const keysMap = {};
		replaceUIElement((sNode) => {
			let keys = keysMap[sNode.class];
			if (keys === undefined) {
				const type = UI.inspectorTypeMap[sNode.class];
				const node = Inspector[type].create();
				keys = keysMap[sNode.class] = Object.keys(node);
			}
			const dNode = {};
			for (const key of keys) {
				if (key in sNode) {
					dNode[key] = sNode[key];
					continue;
				}
				switch (key) {
					case 'pointerEvents':
						dNode[key] = 'enabled';
						continue;
				}
			}
			return dNode;
		});
	}
	if (verNum < Updater.getVersionNumber('1.0.118')) {
		const keys = Object.keys(Inspector.uiVideo.create());
		replaceUIElement((sNode) => {
			if (sNode.class === 'video') {
				const dNode = Inspector.uiVideo.create();
				for (const key of keys) {
					if (key in sNode) {
						dNode[key] = sNode[key];
					}
				}
				return dNode;
			}
		});
	}
};
