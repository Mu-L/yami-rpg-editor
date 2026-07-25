import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Editor } from '@/main/editor.ts';
import { Window } from '@/tools/window-object.ts';

export const ObjectFolder = {
	initialize: null,
	open: null,
	confirm: null
};

ObjectFolder.initialize = function () {
	$('#object-folder-confirm').on('click', this.confirm);
};

ObjectFolder.open = function () {
	Window.open('object-folder');
	const data = Editor.project.scene.defaultFolders;
	const write = getElementWriter('object-folder', data);
	write('tilemap');
	write('actor');
	write('region');
	write('light');
	write('animation');
	write('particle');
	write('parallax');
};

ObjectFolder.confirm = function (event) {
	const read = getElementReader('object-folder');
	Editor.project.scene.defaultFolders = {
		tilemap: read('tilemap'),
		actor: read('actor'),
		region: read('region'),
		light: read('light'),
		animation: read('animation'),
		particle: read('particle'),
		parallax: read('parallax')
	};
	Window.close('object-folder');
};
