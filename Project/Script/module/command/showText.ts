import { $, measureText } from '../../util/dom.ts';
import { Command } from '../../command/command-object.ts';
import { Token } from '../../command/mark-string-manager.ts';
import { GameLocal } from '../../local/local-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '../../tools/localization.ts';

Command.cases.showText = new CommandSchema({
	name: 'showText',
	latinCharWidth: 0,
	otherCharWidth: 0,
	onInitialize() {
		$('#showText-confirm').on('click', () => this.save());
	},
	customParse({ target, parameters, content }) {
		const alias = Local.get('command.showText.alias');
		const words = Command.words
			.push(Command.parseActor(target))
			.push(Command.setCommaColors(parameters));
		const contents = [
			{ fold: true },
			{ color: 'element' },
			{ text: alias + Token(': ') },
			{ color: 'gray' },
			{ color: 'save' },
			{ text: words.join() }
		];
		content = GameLocal.replace(content);
		content = Command.parseVariableTag(content);
		this.appendTextLines(contents, alias, content);
		return contents;
	},
	customLoad({ target = { type: 'trigger' }, parameters = '', content = '' }) {
		$('#showText-target').write(target);
		$('#showText-parameters').write(parameters);
		$('#showText-content').write(content);
		if (content === '') {
			$('#showText-target').getFocus();
		} else {
			$('#showText-content').getFocus();
		}
	},
	customSave() {
		const target = $('#showText-target').read();
		const parameters = $('#showText-parameters').read();
		const content = $('#showText-content').read();
		if (content === '') {
			return $('#showText-content').getFocus();
		}
		Command.save({ target, parameters, content });
	},
	updateCharWidth() {
		if (this.latinCharWidth === 0) {
			const latinChars = '          ';
			const otherChars = '　　　　　　　　　　';
			const font = 'var(--font-family-mono)';
			this.latinCharWidth = measureText(latinChars, font).width / 10;
			this.otherCharWidth = measureText(otherChars, font).width / 10;
		}
	},
	appendTextLines: (function IIFE() {
		const append = (contents, tag, text) => {
			if (contents.length === 0) {
				contents.push(
					{ color: 'element' },
					{ text: tag + Token(': ') },
					{ color: 'text' },
					{ color: 'save' },
					{ text: text }
				);
			} else {
				contents.push(
					{ break: true },
					{ color: 'transparent' },
					{ text: tag + Token(': ') },
					{ color: 'text' },
					{ color: 'save' },
					{ text: text }
				);
			}
		};
		const textIdTag = /^\$_textId_\$(?:\S+?)_\/_\$/;
		const tooltipTag = /^\$_tooltip_\$(?:\S+?)_\/_\$/;
		const classTag = /^\$_class_\$(?:\S+?)_\/_\$/;
		const colorTag = /^\$_\S+?_\$([\s\S]*?)\$_\/_\$/;
		return function (contents, tag, text) {
			if (!text) return;
			this.updateCharWidth();
			const MAX_LINES = 10;
			const MAX_LINE_WIDTH = 500;
			const length = text.length;
			const { latinCharWidth } = this;
			const { otherCharWidth } = this;
			let lineCount = 0;
			let lineWidth = 0;
			let startIndex = 0;
			for (let i = 0; i < length; i++) {
				const char = text[i];
				if (char === '\n') {
					const line = text.slice(startIndex, i);
					append(contents, tag, line);
					lineWidth = 0;
					startIndex = i + 1;
					if (++lineCount === MAX_LINES) {
						break;
					}
					continue;
				}
				if (char === '$') {
					const slice = text.slice(i);
					const idMatch = slice.match(textIdTag);
					if (idMatch) {
						i += idMatch[0].length - 1;
						continue;
					}
					const tipMatch = slice.match(tooltipTag);
					if (tipMatch) {
						i += tipMatch[0].length - 1;
						continue;
					}
					const classMatch = slice.match(classTag);
					if (classMatch) {
						i += classMatch[0].length - 1;
						continue;
					}
					const colorMatch = slice.match(colorTag);
					if (colorMatch) {
						for (const char of colorMatch[1]) {
							lineWidth += char < '\xff' ? latinCharWidth : otherCharWidth;
						}
						i += colorMatch[0].length - 1;
						continue;
					}
				}
				const charWidth = char < '\xff' ? latinCharWidth : otherCharWidth;
				lineWidth += charWidth;
				if (lineWidth > MAX_LINE_WIDTH) {
					const line = text.slice(startIndex, i);
					append(contents, tag, line);
					lineWidth = charWidth;
					startIndex = i;
					if (++lineCount === MAX_LINES) {
						break;
					}
					continue;
				}
			}
			if (lineCount === MAX_LINES) {
				append(contents, tag, '......');
			} else if (lineWidth !== 0) {
				const line = text.slice(startIndex, length);
				append(contents, tag, line);
			}
		};
	})()
});
