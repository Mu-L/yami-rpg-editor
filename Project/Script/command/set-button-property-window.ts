import { createPropertyWindow } from './property-window-factory.ts';
import { Command } from './command-object.ts';
import { Token } from './mark-string-manager.ts';

// ******************************** 设置按钮 - 属性窗口 ********************************

export const ButtonProperty = createPropertyWindow({
	prefix: 'setButton',
	locale: 'command.setButton',
	keys: [
		{
			name: 'Normal Image',
			value: 'normalImage',
			cases: ['normalImage', 'hoverImage', 'activeImage'],
			uiName: 'image',
			default: ''
		},
		{
			name: 'Hover Image',
			value: 'hoverImage',
			cases: ['normalImage', 'hoverImage', 'activeImage'],
			uiName: 'image',
			default: ''
		},
		{
			name: 'Active Image',
			value: 'activeImage',
			cases: ['normalImage', 'hoverImage', 'activeImage'],
			uiName: 'image',
			default: ''
		},
		{
			name: 'Normal Clip',
			value: 'normalClip',
			cases: ['normalClip', 'hoverClip', 'activeClip'],
			uiName: 'clip-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Hover Clip',
			value: 'hoverClip',
			cases: ['normalClip', 'hoverClip', 'activeClip'],
			uiName: 'clip-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Active Clip',
			value: 'activeClip',
			cases: ['normalClip', 'hoverClip', 'activeClip'],
			uiName: 'clip-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Normal Tint',
			value: 'normalTint',
			cases: ['normalTint', 'hoverTint', 'activeTint'],
			uiName: 'tint-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Hover Tint',
			value: 'hoverTint',
			cases: ['normalTint', 'hoverTint', 'activeTint'],
			uiName: 'tint-box',
			default: [0, 0, 0, 0]
		},
		{
			name: 'Active Tint',
			value: 'activeTint',
			cases: ['normalTint', 'hoverTint', 'activeTint'],
			uiName: 'tint-box',
			default: [0, 0, 0, 0]
		},
		{ name: 'Image Opacity', value: 'imageOpacity', default: 1 },
		{ name: 'Content', value: 'content', default: '' },
		{ name: 'Size', value: 'size', default: 16 },
		{ name: 'Letter Spacing', value: 'letterSpacing', default: 0 }
	],
	openData(defaults: any, key: any, value: any) {
		switch (key) {
			case 'normalImage':
			case 'hoverImage':
			case 'activeImage':
				defaults.image = value;
				break;
			case 'normalClip':
			case 'hoverClip':
			case 'activeClip':
				defaults['clip-0'] = value[0];
				defaults['clip-1'] = value[1];
				defaults['clip-2'] = value[2];
				defaults['clip-3'] = value[3];
				break;
			case 'normalTint':
			case 'hoverTint':
			case 'activeTint':
				defaults['tint-0'] = value[0];
				defaults['tint-1'] = value[1];
				defaults['tint-2'] = value[2];
				defaults['tint-3'] = value[3];
				break;
			default:
				defaults[key] = value;
				break;
		}
	},
	saveData(key: any, read: any) {
		switch (key) {
			case 'normalImage':
			case 'hoverImage':
			case 'activeImage':
				return read('image');
			case 'normalClip':
			case 'hoverClip':
			case 'activeClip':
				return [
					read('clip-0'),
					read('clip-1'),
					read('clip-2'),
					read('clip-3')
				];
			case 'normalTint':
			case 'hoverTint':
			case 'activeTint':
				return [
					read('tint-0'),
					read('tint-1'),
					read('tint-2'),
					read('tint-3')
				];
			default:
				return read(key);
		}
	},
	parsers: {
		normalImage: (value: string): string => Command.parseFileName!(value),
		hoverImage: (value: string): string => Command.parseFileName!(value),
		activeImage: (value: string): string => Command.parseFileName!(value),
		normalClip: (value: number[]): string => {
			const params = [
				Command.setNumberColor!(value[0]),
				Command.setNumberColor!(value[1]),
				Command.setNumberColor!(value[2]),
				Command.setNumberColor!(value[3])
			];
			return params.join(Token(', '));
		},
		hoverClip: (value: number[]): string => {
			const params = [
				Command.setNumberColor!(value[0]),
				Command.setNumberColor!(value[1]),
				Command.setNumberColor!(value[2]),
				Command.setNumberColor!(value[3])
			];
			return params.join(Token(', '));
		},
		activeClip: (value: number[]): string => {
			const params = [
				Command.setNumberColor!(value[0]),
				Command.setNumberColor!(value[1]),
				Command.setNumberColor!(value[2]),
				Command.setNumberColor!(value[3])
			];
			return params.join(Token(', '));
		},
		normalTint: (value: number[]): string => {
			const params = [
				Command.setNumberColor!(value[0]),
				Command.setNumberColor!(value[1]),
				Command.setNumberColor!(value[2]),
				Command.setNumberColor!(value[3])
			];
			return params.join(Token(', '));
		},
		hoverTint: (value: number[]): string => {
			const params = [
				Command.setNumberColor!(value[0]),
				Command.setNumberColor!(value[1]),
				Command.setNumberColor!(value[2]),
				Command.setNumberColor!(value[3])
			];
			return params.join(Token(', '));
		},
		activeTint: (value: number[]): string => {
			const params = [
				Command.setNumberColor!(value[0]),
				Command.setNumberColor!(value[1]),
				Command.setNumberColor!(value[2]),
				Command.setNumberColor!(value[3])
			];
			return params.join(Token(', '));
		},
		content: (value: any): string => Command.parseVariableTemplate!(value),
		imageOpacity: (value: number): string => Command.setNumberColor!(value),
		size: (value: number): string => Command.setNumberColor!(value),
		letterSpacing: (value: number): string => Command.setNumberColor!(value)
	}
});
