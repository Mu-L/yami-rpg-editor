import { Editor } from './editor.ts';

// 开关快捷键
Editor.switchHotkey = (function IIFE() {
	const keydown = function (event) {
		if (event.cmdOrCtrlKey) {
			switch (event.code) {
				case 'KeyN':
				case 'KeyO':
				case 'KeyZ':
				case 'KeyY':
					return;
			}
		} else {
			switch (event.code) {
				case 'Enter':
				case 'Escape':
				case 'ArrowUp':
				case 'ArrowDown':
					return;
			}
		}
		event.stopPropagation();
	};
	return function (enabled) {
		switch (enabled) {
			case true:
				window.off('keydown', keydown, { capture: true });
				break;
			case false:
				window.on('keydown', keydown, { capture: true });
				break;
		}
	};
})();
