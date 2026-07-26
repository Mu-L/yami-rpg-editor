import { $ } from '@/util/dom.ts';
import { File } from '@/file/file-system-core.ts';
import { Browser } from '@/browser/project-browser.ts';
import { Inspector } from './inspector.ts';

{
	const FileFont = {
		target: null,
		meta: null,
		symbol: null,
		font: null,
		input: null,
		previews: null,
		initialize: null,
		open: null,
		close: null,
		windowResize: null,
		textInput: null
	};

	FileFont.initialize = function () {
		this.previews = $('.fileFont-preview');

		this.input = $('#fileFont-content');
		this.input.write('Yami RPG Editor');
		this.textInput({ target: this.input.input });

		$('#fileFont').on('resize', this.windowResize);
		this.input.on('input', this.textInput);
	};

	FileFont.open = function (file, meta) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileFont-name');
			const elSize = $('#fileFont-size');
			const size = Number(file.stats.size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize(size);

			const previews = this.previews;
			const path = File.route(file.path);
			const url = CSS.encodeURL(path);
			const font = new FontFace('preview', url);
			for (const preview of previews) {
				preview.hide();
			}
			if (this.font instanceof FontFace) {
				document.fonts.delete(this.font);
			}
			const symbol = (this.symbol = Symbol());
			font.load()
				.then(() => {
					if (this.symbol === symbol) {
						this.symbol = null;
						this.font = font;
						document.fonts.add(font);
						for (const preview of previews) {
							preview.show();
						}
					}
				})
				.catch(() => {});
		}
	};

	FileFont.close = function () {
		if (this.target) {
			if (this.font instanceof FontFace) {
				document.fonts.delete(this.font);
			}
			Browser.unselect(this.meta);
			this.target = null;
			this.meta = null;
			this.symbol = null;
			this.font = null;
		}
	};

	FileFont.windowResize = function () {
		const previews = FileFont.previews;
		const dpr = window.devicePixelRatio;
		if (previews.dpr !== dpr) {
			previews.dpr = dpr;
			$('#fileFont-font-grid').style.fontSize = `${12 / dpr}px`;
		}
	};

	FileFont.textInput = function (event) {
		const text = event.target.value;
		for (const element of FileFont.previews) {
			element.textContent = text;
		}
	};

	Inspector.fileFont = FileFont;
}
