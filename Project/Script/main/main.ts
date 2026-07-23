import { Editor } from './editor.ts';

// ******************************** 主函数 ********************************

(function main() {
	const start = () => Editor.initialize();
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
})();
