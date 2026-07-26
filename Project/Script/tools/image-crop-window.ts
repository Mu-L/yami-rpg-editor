import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { File } from '@/file/file-system-core.ts';
import { Local } from './localization.ts';
import { Cursor } from './pointer-object.ts';
import { Window } from './window-object.ts';
import { Path } from '@/util/config.ts';

export const ImageClip = {
	window: $('#imageClip'),
	screen: $('#imageClip-screen'),
	image: $('#imageClip-image').hide(),
	marquee: $('#imageClip-marquee').hide(),
	target: null,
	symbol: null,
	dragging: null,
	initialize: null,
	open: null,
	loadImage: null,
	updateImage: null,
	updateTitle: null,
	updateMarquee: null,
	shiftMarquee: null,
	scrollToMarquee: null,
	startDragging: null,
	dprchange: null,
	windowClosed: null,
	windowResize: null,
	screenKeydown: null,
	marqueePointerdown: null,
	marqueeDoubleclick: null,
	pointerup: null,
	pointermove: null,
	paramInput: null,
	confirm: null
};

ImageClip.initialize = function () {
	window.on('dprchange', this.dprchange);
	this.window.on('closed', this.windowClosed);
	this.window.on('resize', this.windowResize);
	this.screen.on('keydown', this.screenKeydown);
	this.marquee.on('pointerdown', this.marqueePointerdown);
	this.marquee.on('doubleclick', this.marqueeDoubleclick);
	$('#imageClip-x, #imageClip-y, #imageClip-width, #imageClip-height').on(
		'input',
		this.paramInput
	);
	$('#imageClip-confirm').on('click', this.confirm);
};

ImageClip.open = async function (target) {
	this.target = target;
	Window.open('imageClip');

	const write = getElementWriter('imageClip');
	const [x, y, width, height] = target.read();
	write('x', x);
	write('y', y);
	write('width', width);
	write('height', height);

	this.loadImage();
};

ImageClip.loadImage = function () {
	this.window.setTitle('');

	const id = this.target.getAttribute('image');
	const guid = $('#' + id).read();
	const path = File.getPath(guid);
	if (path) {
		const image = this.image;
		image.src = File.route(path);

		const symbol = (this.symbol = Symbol());
		void new Promise((resolve) => {
			const intervalIndex = setInterval(() => {
				if (image.naturalWidth !== 0) {
					if (this.symbol === symbol) {
						this.updateImage();
						this.updateMarquee();
						this.scrollToMarquee('center');
					}
					clearInterval(intervalIndex);
					resolve(image);
				} else if (image.complete) {
					clearInterval(intervalIndex);
					resolve(null);
				}
			});
		}).then((image) => {
			if (this.symbol === symbol) {
				this.symbol = null;
				this.updateTitle(path, image);
			}
		});
	} else {
		this.updateTitle();
	}
};

ImageClip.updateImage = function () {
	const screen = this.screen;
	const image = this.image.hide();
	const marquee = this.marquee.hide();

	const dpr = window.devicePixelRatio;
	const width = image.naturalWidth;
	const height = image.naturalHeight;
	const left = Math.max((screen.clientWidth * dpr - width) >> 1, 0);
	const top = Math.max((screen.clientHeight * dpr - height) >> 1, 0);
	image.style.left = `${left / dpr}px`;
	image.style.top = `${top / dpr}px`;
	image.style.width = `${width / dpr}px`;
	image.style.height = `${height / dpr}px`;
	image.show();
	marquee.scaleX = 1 / dpr;
	marquee.scaleY = 1 / dpr;
	marquee.style.left = `${left / dpr}px`;
	marquee.style.top = `${top / dpr}px`;
	marquee.style.width = `${width / dpr}px`;
	marquee.style.height = `${height / dpr}px`;
	marquee.show();
};

ImageClip.updateTitle = function (path, image) {
	let info;
	if (path && image) {
		const name = Path.basename(path);
		const alias = File.filterGUID(name);
		const width = image.naturalWidth;
		const height = image.naturalHeight;
		info = `${alias} - ${width}x${height}`;
	} else {
		info = Local.get('common.none');
	}
	this.window.setTitle(info);
};

ImageClip.updateMarquee = function () {
	const read = getElementReader('imageClip');
	const x = read('x');
	const y = read('y');
	const width = read('width');
	const height = read('height');
	this.marquee.select(x, y, width, height);
};

ImageClip.shiftMarquee = function (ox, oy) {
	const image = this.image;
	const iw = image.naturalWidth;
	const ih = image.naturalHeight;
	if (iw * ih === 0) return;
	const read = getElementReader('imageClip');
	const write = getElementWriter('imageClip');
	const sx = read('x');
	const sy = read('y');
	const sw = read('width');
	const sh = read('height');
	const dx = Math.clamp(sx + ox * sw, 0, iw - sw);
	const dy = Math.clamp(sy + oy * sh, 0, ih - sh);
	if (sx !== dx) write('x', dx);
	if (sy !== dy) write('y', dy);
	this.updateMarquee();
	this.scrollToMarquee('active');
};

ImageClip.scrollToMarquee = function (mode) {
	const screen = this.screen;
	const marquee = this.marquee;
	const dpr = window.devicePixelRatio;
	const mx = marquee.x;
	const my = marquee.y;
	const mw = marquee.width;
	const mh = marquee.height;
	const sw = screen.clientWidth * dpr;
	const sh = screen.clientHeight * dpr;
	switch (mode) {
		case 'active': {
			const minSL = (mx + mw - sw) / dpr;
			const maxSL = mx / dpr;
			const minST = (my + mh - sh) / dpr;
			const maxST = my / dpr;
			screen.scrollLeft = Math.clamp(screen.scrollLeft, minSL, maxSL);
			screen.scrollTop = Math.clamp(screen.scrollTop, minST, maxST);
			break;
		}
		case 'center': {
			const x = mx + mw / 2;
			const y = my + mh / 2;
			const sl = x - (sw >> 1);
			const st = y - (sh >> 1);
			screen.scrollLeft = Math.round(sl / dpr);
			screen.scrollTop = Math.round(st / dpr);
			break;
		}
	}
};

ImageClip.startDragging = function (event) {
	Cursor.open('cursor-grab');
	this.dragging = event;
	event.mode = 'scroll';
	event.scrollLeft = this.screen.scrollLeft;
	event.scrollTop = this.screen.scrollTop;
	window.on('pointerup', this.pointerup);
	window.on('pointermove', this.pointermove);
};

ImageClip.dprchange = function () {
	if (!this.image.hasClass('hidden')) {
		this.updateImage();
		this.updateMarquee();
	}
}.bind(ImageClip);

ImageClip.windowClosed = function () {
	if (this.dragging) {
		this.pointerup(this.dragging);
	}
	this.target = null;
	this.symbol = null;
	this.image.src = '';
	this.image.hide();
	this.marquee.hide();
}.bind(ImageClip);

ImageClip.windowResize = function () {
	if (!this.image.hasClass('hidden')) {
		this.updateImage();
	}
}.bind(ImageClip);

ImageClip.screenKeydown = function (event) {
	if (this.dragging) {
		return;
	}
	if (event.cmdOrCtrlKey) {
		return;
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'ArrowLeft':
				event.preventDefault();
				this.shiftMarquee(-1, 0);
				break;
			case 'ArrowUp':
				event.preventDefault();
				this.shiftMarquee(0, -1);
				break;
			case 'ArrowRight':
				event.preventDefault();
				this.shiftMarquee(1, 0);
				break;
			case 'ArrowDown':
				event.preventDefault();
				this.shiftMarquee(0, 1);
				break;
		}
	}
}.bind(ImageClip);

ImageClip.marqueePointerdown = function (event) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.altKey) {
				return this.startDragging(event);
			}
			const marquee = this.marquee;
			const coords = event.getRelativeCoords(marquee);
			const read = getElementReader('imageClip');
			const write = getElementWriter('imageClip');
			const x = coords.x / marquee.scaleX;
			const y = coords.y / marquee.scaleY;
			const cw = Math.max(read('width'), 1);
			const ch = Math.max(read('height'), 1);
			const cx = Math.floor(x / cw) * cw;
			const cy = Math.floor(y / ch) * ch;
			write('x', cx);
			write('y', cy);
			this.updateMarquee();
			break;
		}
		case 2:
			this.startDragging(event);
			break;
	}
}.bind(ImageClip);

ImageClip.marqueeDoubleclick = function (event) {
	if (!event.altKey) {
		this.confirm(event);
	}
}.bind(ImageClip);

ImageClip.pointerup = function (event) {
	const { dragging } = this;
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		this.dragging = null;
		window.off('pointerup', this.pointerup);
		window.off('pointermove', this.pointermove);
	}
}.bind(ImageClip);

ImageClip.pointermove = function (event) {
	const { dragging } = this;
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'scroll':
				this.screen.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX;
				this.screen.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY;
				break;
		}
	}
}.bind(ImageClip);

ImageClip.paramInput = function () {
	ImageClip.updateMarquee();
};

ImageClip.confirm = function () {
	const read = getElementReader('imageClip');
	this.target.input([read('x'), read('y'), read('width'), read('height')]);
	Window.close('imageClip');
}.bind(ImageClip);
