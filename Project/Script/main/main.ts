import { Editor } from './editor.ts';

(function main() {
	const start = () => Editor.initialize();
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
})();
